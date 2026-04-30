import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  GOAL_CALENDAR_HOLD_FADE_OUT_DURATION_MS,
  GOAL_CALENDAR_HOLD_RESET_DURATION_MS,
  GOAL_CALENDAR_LONG_PRESS_DURATION_MS,
} from "@/features/goals/lib/goalsConstants";
import {
  getDropIndicatorStyle,
  getHeatCellStyle,
  toDisplayDate,
} from "@/features/goals/lib/goalsUtils";

const HOLD_CANCEL_DISTANCE_PX = 8;

type HoldTransitionTiming = "ease-out" | "ease-in-out";

type Props = {
  dateKey: string;
  isInCurrentYear: boolean;
  isToday: boolean;
  hasScore: boolean;
  score: number;
  dayGoalId: number | null;
  isConfirmed: boolean;
  isConfirmPending: boolean;
  isPreviewTarget: boolean;
  isCreating: boolean;
  isSelectedDay: boolean;
  draggingTemplate: boolean;
  isEraserOn: boolean;
  onHoverDate: (dateKey: string) => void;
  onConfirmDayGoal: (dayGoalId: number, dateKey: string) => void;
  onActivate: (dateKey: string, isInCurrentYear: boolean) => void;
};

export const GoalCalendarDayCell = memo(function GoalCalendarDayCell({
  dateKey,
  isInCurrentYear,
  isToday,
  hasScore,
  score,
  dayGoalId,
  isConfirmed,
  isConfirmPending,
  isPreviewTarget,
  isCreating,
  isSelectedDay,
  draggingTemplate,
  isEraserOn,
  onHoverDate,
  onConfirmDayGoal,
  onActivate,
}: Props) {
  const pressedByMouseRef = useRef(false);
  const holdTriggeredRef = useRef(false);
  const pressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHoldVisible, setIsHoldVisible] = useState(false);
  const [holdTransitionMs, setHoldTransitionMs] = useState(0);
  const [holdTransitionTiming, setHoldTransitionTiming] =
    useState<HoldTransitionTiming>("ease-out");

  const canConfirmDayGoal =
    isInCurrentYear &&
    !draggingTemplate &&
    !isEraserOn &&
    !!dayGoalId &&
    !isConfirmed &&
    !isConfirmPending;

  const statusLabel = !dayGoalId
    ? "No goal"
    : isConfirmPending
      ? "Confirming..."
      : isConfirmed
        ? "Confirmed"
        : "Hold to confirm";

  const clearTimers = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (holdResetRef.current) {
      clearTimeout(holdResetRef.current);
      holdResetRef.current = null;
    }

    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const finishHoldVisual = useCallback(() => {
    clearTimers();
    setHoldTransitionMs(GOAL_CALENDAR_HOLD_FADE_OUT_DURATION_MS);
    setHoldTransitionTiming("ease-out");
    setIsHoldVisible(false);
    holdResetRef.current = setTimeout(() => {
      setHoldProgress(0);
      setHoldTransitionMs(0);
    }, GOAL_CALENDAR_HOLD_FADE_OUT_DURATION_MS);
  }, [clearTimers]);

  const resetHoldVisual = useCallback(() => {
    clearTimers();

    if (!isHoldVisible && holdProgress === 0) {
      return;
    }

    setHoldTransitionMs(GOAL_CALENDAR_HOLD_RESET_DURATION_MS);
    setHoldTransitionTiming("ease-out");
    setHoldProgress(0);
    setIsHoldVisible(true);
    holdResetRef.current = setTimeout(() => {
      setIsHoldVisible(false);
      setHoldTransitionMs(0);
    }, GOAL_CALENDAR_HOLD_RESET_DURATION_MS);
  }, [clearTimers, holdProgress, isHoldVisible]);

  const startHoldVisual = useCallback(() => {
    clearTimers();
    setIsHoldVisible(true);
    setHoldProgress(0);
    setHoldTransitionMs(0);
    setHoldTransitionTiming("ease-out");

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setHoldTransitionMs(GOAL_CALENDAR_LONG_PRESS_DURATION_MS);
      setHoldTransitionTiming("ease-in-out");
      setHoldProgress(1);
    });
  }, [clearTimers]);

  useEffect(() => {
    if (!isConfirmPending && !isConfirmed) {
      return;
    }

    finishHoldVisual();
    holdTriggeredRef.current = false;
    return undefined;
  }, [finishHoldVisual, isConfirmPending, isConfirmed]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const handlePointerDown = (clientX: number, clientY: number) => {
    pressOriginRef.current = { x: clientX, y: clientY };
    holdTriggeredRef.current = false;

    if (!canConfirmDayGoal || !dayGoalId) {
      return;
    }

    startHoldVisual();
    holdTimeoutRef.current = setTimeout(() => {
      clearTimers();
      holdTriggeredRef.current = true;
      onConfirmDayGoal(dayGoalId, dateKey);
      finishHoldVisual();
    }, GOAL_CALENDAR_LONG_PRESS_DURATION_MS);
  };

  const handlePointerRelease = useCallback(() => {
    pressOriginRef.current = null;

    if (holdTriggeredRef.current || isConfirmPending || isConfirmed) {
      return;
    }

    resetHoldVisual();
  }, [isConfirmPending, isConfirmed, resetHoldVisual]);

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const origin = pressOriginRef.current;
      if (!origin) return;

      if (
        Math.hypot(clientX - origin.x, clientY - origin.y) <
        HOLD_CANCEL_DISTANCE_PX
      ) {
        return;
      }

      pressOriginRef.current = null;

      if (holdTriggeredRef.current || isConfirmPending || isConfirmed) {
        return;
      }

      resetHoldVisual();
    },
    [isConfirmPending, isConfirmed, resetHoldVisual]
  );

  const cellStyle: CSSProperties = {
    ...getHeatCellStyle(score, hasScore && isInCurrentYear),
    ...getDropIndicatorStyle(draggingTemplate, isPreviewTarget, isInCurrentYear),
    ...(isToday && isInCurrentYear
      ? {
          outline: "2px solid rgba(251,191,36,0.85)",
          outlineOffset: "1px",
        }
      : {}),
  };

  return (
    <div
      data-goal-date={dateKey}
      title={`${toDisplayDate(dateKey)} | ${statusLabel}${hasScore ? ` | ${Math.round(score)}%` : ""}`}
      aria-busy={isConfirmPending || undefined}
      onClick={() => {
        if (pressedByMouseRef.current) {
          pressedByMouseRef.current = false;
          return;
        }

        if (holdTriggeredRef.current) {
          holdTriggeredRef.current = false;
          return;
        }

        onActivate(dateKey, isInCurrentYear);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch" && event.button !== 0) return;

        if (event.pointerType !== "touch" && event.button === 0) {
          pressedByMouseRef.current = true;
          onActivate(dateKey, isInCurrentYear);
        }

        handlePointerDown(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        handlePointerMove(event.clientX, event.clientY);
      }}
      onPointerUp={handlePointerRelease}
      onPointerEnter={() => {
        if (draggingTemplate) onHoverDate(dateKey);
      }}
      onPointerLeave={() => {
        handlePointerRelease();
        if (pressedByMouseRef.current) {
          pressedByMouseRef.current = false;
        }
      }}
      onPointerCancel={() => {
        handlePointerRelease();
        if (pressedByMouseRef.current) {
          pressedByMouseRef.current = false;
        }
      }}
      onContextMenu={(event) => {
        if (canConfirmDayGoal || isEraserOn) {
          event.preventDefault();
        }
      }}
      className={[
        "relative aspect-square w-full overflow-hidden rounded-[4px] border transition-[border-color,box-shadow,outline-color,opacity,filter] duration-300 ease-out",
        isInCurrentYear
          ? "cursor-pointer border-border/70"
          : "cursor-default border-transparent bg-transparent",
        isConfirmPending ? "cursor-wait" : "",
        isInCurrentYear && !hasScore ? "bg-surfaceMuted" : "",
        draggingTemplate && isPreviewTarget
          ? isInCurrentYear
            ? "border-sky-200 shadow-[0_0_0_2px_rgba(59,130,246,0.45)]"
            : "border-red-200 shadow-[0_0_0_2px_rgba(239,68,68,0.45)]"
          : "",
        isSelectedDay && isInCurrentYear
          ? "border-sky-300 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
          : "",
        isToday && isInCurrentYear
          ? "border-amber-300/80 shadow-[0_0_18px_rgba(251,146,60,0.24)]"
          : "",
        isCreating ? "animate-pulse" : "",
      ].join(" ")}
      style={cellStyle}
    >
      {isInCurrentYear ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[1px] rounded-[3px] bg-gradient-to-t from-emerald-500/95 via-sky-400/80 to-sky-100/70 transition-opacity duration-200 ease-out"
            style={{
              transform: `scaleY(${holdProgress})`,
              transformOrigin: "bottom",
              opacity: isHoldVisible
                ? Math.max(0.2, 0.25 + holdProgress * 0.75)
                : 0,
              transition: [
                `transform ${holdTransitionMs}ms ${holdTransitionTiming}`,
                `opacity ${isHoldVisible ? 220 : GOAL_CALENDAR_HOLD_FADE_OUT_DURATION_MS}ms ease-out`,
              ].join(", "),
            }}
          />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-[1px] rounded-[3px] border border-transparent"
            style={{
              opacity: isHoldVisible ? 1 : 0,
              boxShadow: isHoldVisible
                ? "inset 0 0 0 1px rgba(255,255,255,0.26), 0 0 10px rgba(56,189,248,0.22)"
                : "none",
              transition: `opacity 220ms ease-out, box-shadow 320ms ease-in-out`,
            }}
          />

          {isConfirmPending ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[1px] animate-pulse rounded-[3px] border border-sky-100/90 bg-sky-500/18"
            />
          ) : null}

          {isConfirmed ? (
            <span
              aria-hidden
              className="pointer-events-none absolute right-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-emerald-50 shadow-[0_0_0_1px_rgba(34,197,94,0.35),0_0_12px_rgba(34,197,94,0.35)]"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
});
