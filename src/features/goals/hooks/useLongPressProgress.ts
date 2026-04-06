import { useCallback, useEffect, useRef, useState } from "react";

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export function useLongPressProgress(
  holdDurationMs: number,
  resetDurationMs = 220
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const activeIdRef = useRef<string | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const clearRuntime = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const clearState = useCallback(() => {
    activeIdRef.current = null;
    progressRef.current = 0;
    setActiveId(null);
    setProgress(0);
  }, []);

  const animateProgress = useCallback(
    (
      targetProgress: number,
      durationMs: number,
      easing: (value: number) => number,
      onComplete?: () => void
    ) => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      const startedAt = performance.now();
      const initialProgress = progressRef.current;
      const delta = targetProgress - initialProgress;

      const tick = (timestamp: number) => {
        const elapsed = timestamp - startedAt;
        const normalized =
          durationMs <= 0 ? 1 : Math.min(elapsed / durationMs, 1);
        const easedProgress = easing(normalized);
        const nextProgress = initialProgress + delta * easedProgress;

        progressRef.current = nextProgress;
        setProgress(nextProgress);

        if (normalized < 1) {
          frameRef.current = requestAnimationFrame(tick);
          return;
        }

        frameRef.current = null;
        onComplete?.();
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    []
  );

  const start = useCallback(
    (id: string, onComplete: () => void) => {
      clearRuntime();

      activeIdRef.current = id;
      progressRef.current = 0;
      setActiveId(id);
      setProgress(0);
      animateProgress(100, holdDurationMs, (value) => value);

      holdTimeoutRef.current = setTimeout(() => {
        clearRuntime();
        onComplete();
        clearState();
      }, holdDurationMs);
    },
    [animateProgress, clearRuntime, clearState, holdDurationMs]
  );

  const stop = useCallback(
    (id: string) => {
      if (activeIdRef.current !== id) {
        return;
      }

      clearRuntime();
      animateProgress(0, resetDurationMs, easeOutCubic, () => {
        clearState();
      });
    },
    [animateProgress, clearRuntime, clearState, resetDurationMs]
  );

  useEffect(() => {
    return () => {
      clearRuntime();
    };
  }, [clearRuntime]);

  return {
    activeId,
    progress,
    start,
    stop,
  };
}
