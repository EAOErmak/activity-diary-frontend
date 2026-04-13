import * as React from "react";

import { cn } from "@/shared/lib/utils";

import {
  findActiveDescriptionTag,
  findBestMatchingTag,
} from "./descriptionTagAutocomplete";

type Props = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value"
> & {
  onChange: (value: string) => void;
  tags: readonly string[];
  value: string;
};

type SelectionState = {
  start: number | null;
  end: number | null;
};

function setForwardedRef<T>(
  ref: React.ForwardedRef<T>,
  value: T | null
) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

export const DescriptionTagAutocompleteTextarea = React.forwardRef<
  HTMLTextAreaElement,
  Props
>(function DescriptionTagAutocompleteTextarea(
  {
    className,
    disabled,
    onBlur,
    onChange,
    onCompositionEnd,
    onCompositionStart,
    onFocus,
    onKeyDown,
    onScroll,
    onSelect,
    spellCheck = false,
    tags,
    value,
    ...props
  },
  forwardedRef
) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = React.useState<SelectionState>({
    start: null,
    end: null,
  });
  const [scrollPosition, setScrollPosition] = React.useState({
    left: 0,
    top: 0,
  });
  const [dismissedSuggestionKey, setDismissedSuggestionKey] =
    React.useState<string | null>(null);
  const [isComposing, setIsComposing] = React.useState(false);

  const syncTextareaState = React.useCallback((textarea: HTMLTextAreaElement | null) => {
    if (!textarea) {
      return;
    }

    setSelection({
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    setScrollPosition({
      left: textarea.scrollLeft,
      top: textarea.scrollTop,
    });
  }, []);

  const setTextareaRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      setForwardedRef(forwardedRef, node);

      if (node) {
        syncTextareaState(node);
      }
    },
    [forwardedRef, syncTextareaState]
  );

  React.useLayoutEffect(() => {
    syncTextareaState(textareaRef.current);
  }, [syncTextareaState, value]);

  const activeTag = React.useMemo(() => {
    if (isComposing) {
      return null;
    }

    return findActiveDescriptionTag(value, selection.start, selection.end);
  }, [isComposing, selection.end, selection.start, value]);

  const suggestedTag = React.useMemo(() => {
    if (!activeTag) {
      return null;
    }

    return findBestMatchingTag(activeTag.query, tags);
  }, [activeTag, tags]);

  const completion =
    activeTag && suggestedTag
      ? suggestedTag.slice(activeTag.query.length)
      : "";

  const suggestionKey =
    activeTag && suggestedTag && completion
      ? `${activeTag.hashIndex}:${activeTag.query.toLocaleLowerCase()}:${suggestedTag.toLocaleLowerCase()}`
      : null;

  const isSuggestionVisible =
    Boolean(suggestionKey) && suggestionKey !== dismissedSuggestionKey;

  const cursorIndex = selection.start ?? value.length;
  const textBeforeCursor = value.slice(0, cursorIndex);
  const textAfterCursor = value.slice(cursorIndex);

  const acceptSuggestion = React.useCallback(() => {
    if (!activeTag || !completion || disabled) {
      return;
    }

    const nextValue =
      value.slice(0, activeTag.cursorIndex) +
      completion +
      value.slice(activeTag.cursorIndex);
    const nextCursorIndex = activeTag.cursorIndex + completion.length;

    onChange(nextValue);
    setDismissedSuggestionKey(null);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(nextCursorIndex, nextCursorIndex);
      setSelection({
        start: nextCursorIndex,
        end: nextCursorIndex,
      });
    });
  }, [activeTag, completion, disabled, onChange, value]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.currentTarget.value);
      setDismissedSuggestionKey(null);
      syncTextareaState(event.currentTarget);
    },
    [onChange, syncTextareaState]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || !isSuggestionVisible) {
        return;
      }

      if (event.key === "Tab" || event.key === "ArrowRight") {
        event.preventDefault();
        acceptSuggestion();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setDismissedSuggestionKey(suggestionKey);
      }
    },
    [acceptSuggestion, isSuggestionVisible, onKeyDown, suggestionKey]
  );

  const handleSelect = React.useCallback(
    (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
      syncTextareaState(event.currentTarget);
      onSelect?.(event);
    },
    [onSelect, syncTextareaState]
  );

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLTextAreaElement>) => {
      syncTextareaState(event.currentTarget);
      onScroll?.(event);
    },
    [onScroll, syncTextareaState]
  );

  const handleCompositionStart = React.useCallback(
    (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(true);
      onCompositionStart?.(event);
    },
    [onCompositionStart]
  );

  const handleCompositionEnd = React.useCallback(
    (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(false);
      syncTextareaState(event.currentTarget);
      onCompositionEnd?.(event);
    },
    [onCompositionEnd, syncTextareaState]
  );

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-input transition-colors hover:bg-[hsl(var(--input-hover))]",
        disabled && "opacity-50"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl px-5 py-4 text-base text-foreground"
      >
        <div
          className="min-h-full whitespace-pre-wrap break-words"
          style={{
            transform: `translate(${-scrollPosition.left}px, ${-scrollPosition.top}px)`,
          }}
        >
          <span>{textBeforeCursor}</span>
          {isSuggestionVisible ? (
            <span className="text-muted-foreground">{completion}</span>
          ) : null}
          <span>{textAfterCursor}</span>
          <span>{"\u200b"}</span>
        </div>
      </div>

      <textarea
        {...props}
        ref={setTextareaRef}
        className={cn(
          `
          relative
          z-10
          w-full
          min-h-[120px]
          resize-none
          rounded-2xl
          bg-transparent
          px-5
          py-4
          text-base
          text-transparent
          caret-foreground
          placeholder:text-muted-foreground
          focus:outline-none
          focus:ring-2
          focus:ring-ring
          selection:bg-foreground/15
          `,
          className
        )}
        disabled={disabled}
        spellCheck={spellCheck}
        value={value}
        onBlur={onBlur}
        onChange={handleChange}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onSelect={handleSelect}
      />
    </div>
  );
});
