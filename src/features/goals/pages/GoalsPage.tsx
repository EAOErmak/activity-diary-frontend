import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, Layers, NotebookPen, Target } from "lucide-react";
import { goalApi } from "@/api/goalApi";
import { DailyViewCard } from "@/features/goals/components/DailyViewCard";
import { ConfirmEntryGoalDialogV2 } from "@/features/goals/components/ConfirmEntryGoalDialogV2";
import { GoalCalendarCard } from "@/features/goals/components/GoalCalendarCard";
import { GoalsDragPreview } from "@/features/goals/components/GoalsDragPreview";
import { ReplaceGoalDialog } from "@/features/goals/components/ReplaceGoalDialog";
import { TemplatesSidebar } from "@/features/goals/components/TemplatesSidebar";
import { WeekViewCard } from "@/features/goals/components/WeekViewCard";
import { useGoalCalendarGrid } from "@/features/goals/hooks/useGoalCalendarGrid";
import { useGoalsSummaries } from "@/features/goals/hooks/useGoalsSummaries";
import { useGoalsTemplates } from "@/features/goals/hooks/useGoalsTemplates";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type {
  DragTemplatePayload,
  ReplaceGoalDialogState,
  TemplateFilterKind,
  TemplateItem,
  EraserMode,
} from "@/features/goals/lib/goalsTypes";
import {
  WEEKDAY_FULL_LABELS,
  addDays,
  formatDailyDate,
  formatWeekMonth,
  fromIsoDate,
  getDateKeyAtPoint,
  getGoalKindLabel,
  isDateInRange,
  mergeWeekScores,
  normalizeScore,
  startOfWeekMonday,
  toDisplayDate,
  toIsoDate,
} from "@/features/goals/lib/goalsUtils";
import { cn } from "@/shared/lib/utils";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import type { DiaryEntryGoalSummary } from "@/shared/types/goal";
import { useAuthStore } from "@/shared/store/authStore";

type PointerPosition = {
  x: number;
  y: number;
};

type EntryConfirmDialogState = {
  goalId: number;
  entryName: string;
};

type GoalsWorkspaceView = "calendar" | "week" | "daily";

const isGoalsWorkspaceView = (value: string | null): value is GoalsWorkspaceView =>
  value === "calendar" || value === "week" || value === "daily";

export default function GoalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterKind, setFilterKind] = useState<TemplateFilterKind>("all");
  const [filterName, setFilterName] = useState("");
  const [draggingTemplate, setDraggingTemplate] = useState<DragTemplatePayload | null>(null);
  const [dragPointer, setDragPointer] = useState<PointerPosition | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [replaceDialog, setReplaceDialog] = useState<ReplaceGoalDialogState | null>(null);
  const [isReplacingGoal, setIsReplacingGoal] = useState(false);
  const [eraserMode, setEraserMode] = useState<EraserMode>("eraseOff");
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [lastActionText, setLastActionText] = useState("");
  const [entryConfirmDialog, setEntryConfirmDialog] = useState<EntryConfirmDialogState | null>(
    null
  );
  const [isSubmittingEntryConfirm, setIsSubmittingEntryConfirm] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const viewParam = searchParams.get("view");
  const activeView: GoalsWorkspaceView = isGoalsWorkspaceView(viewParam)
    ? viewParam
    : "calendar";
  const isEraserOn = eraserMode === "eraseOn";

  const hoverDateRef = useRef<string | null>(null);
  useEffect(() => {
    hoverDateRef.current = hoverDate;
  }, [hoverDate]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [calendarYear, setCalendarYear] = useState(currentYear);
  const { yearStart, yearEnd, weeks, monthLabels, calendarFrom, calendarTo } =
    useGoalCalendarGrid(calendarYear);

  const [weekPreviewStart, setWeekPreviewStart] = useState(() => startOfWeekMonday(new Date()));
  const [dailyDate, setDailyDate] = useState(() => {
    const next = new Date();
    next.setHours(0, 0, 0, 0);
    return next;
  });

  const dailyDateKey = useMemo(() => toIsoDate(dailyDate), [dailyDate]);
  const dailyDateLabel = useMemo(() => formatDailyDate(dailyDate), [dailyDate]);

  const { isLoadingTemplates, templateItems, loadTemplates } = useGoalsTemplates();
  const {
    dayScores,
    setDayScores,
    dayGoalIdsByDate,
    weekScores,
    dailyEntries,
    isLoadingDailyEntries,
    reloadAll,
  } = useGoalsSummaries({
    calendarFrom,
    calendarTo,
    dailyDateKey,
  });

  useEffect(() => {
    setHoverDate(null);
  }, [calendarYear]);

  const filteredTemplates = useMemo(() => {
    const normalizedName = filterName.trim().toLowerCase();

    return templateItems.filter((item) => {
      const byType = filterKind === "all" || item.kind === filterKind;
      const byName = item.name.toLowerCase().includes(normalizedName);
      return byType && byName;
    });
  }, [filterKind, filterName, templateItems]);

  const handleViewChange = useCallback(
    (nextView: GoalsWorkspaceView) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("view", nextView);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const previewDateKeys = useMemo(() => {
    if (!hoverDate || !draggingTemplate) return new Set<string>();
    if (draggingTemplate.kind !== "week") return new Set<string>([hoverDate]);

    const hoveredDate = fromIsoDate(hoverDate);
    const monday = startOfWeekMonday(hoveredDate);
    const weekKeys = new Set<string>();

    for (let offset = 0; offset < 7; offset += 1) {
      weekKeys.add(toIsoDate(addDays(monday, offset)));
    }

    return weekKeys;
  }, [draggingTemplate, hoverDate]);

  const canDropAtPointer = useMemo(() => {
    if (!hoverDate) return false;
    return isDateInRange(fromIsoDate(hoverDate), yearStart, yearEnd);
  }, [hoverDate, yearEnd, yearStart]);

  const weekPreviewMonthLabel = useMemo(() => {
    const referenceDate = addDays(weekPreviewStart, 3);
    return formatWeekMonth(referenceDate);
  }, [weekPreviewStart]);

  const weekPreviewDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekPreviewStart, index);
      const dateKey = toIsoDate(date);
      const isInYear = isDateInRange(date, yearStart, yearEnd);
      const hasScore = dateKey in dayScores;
      const score = hasScore ? dayScores[dateKey] ?? 0 : 0;
      const dayGoalId = dayGoalIdsByDate[dateKey] ?? null;

      return {
        date,
        dateKey,
        label: WEEKDAY_FULL_LABELS[index],
        isInYear,
        hasScore,
        score,
        dayGoalId,
      };
    });
  }, [dayGoalIdsByDate, dayScores, weekPreviewStart, yearEnd, yearStart]);

  const weekPreviewStats = useMemo(() => {
    const daysWithGoal = weekPreviewDays.filter((day) => day.isInYear && day.hasScore);
    const total = Math.round(daysWithGoal.reduce((sum, day) => sum + day.score, 0));
    const average = daysWithGoal.length ? Math.round(total / daysWithGoal.length) : 0;
    const finished = daysWithGoal.filter((day) => day.score >= 100).length;
    return { finished, average, total };
  }, [weekPreviewDays]);

  const setDailyDateWithSync = useCallback((nextDate: Date) => {
    const normalized = new Date(nextDate);
    normalized.setHours(0, 0, 0, 0);
    setDailyDate(normalized);
    setWeekPreviewStart(startOfWeekMonday(normalized));
    const nextYear = normalized.getFullYear();
    setCalendarYear((year) => (year === nextYear ? year : nextYear));
  }, []);

  const pickRandomDayInWeek = useCallback((weekStart: Date): Date => {
    const randomOffset = Math.floor(Math.random() * 7);
    const randomDate = addDays(weekStart, randomOffset);
    randomDate.setHours(0, 0, 0, 0);
    return randomDate;
  }, []);

  const setWeekPreviewWithSync = useCallback((nextWeekStart: Date) => {
    const normalizedWeekStart = startOfWeekMonday(nextWeekStart);

    setWeekPreviewStart(normalizedWeekStart);
    const nextYear = addDays(normalizedWeekStart, 3).getFullYear();
    setCalendarYear((year) => (year === nextYear ? year : nextYear));
    setDailyDate(pickRandomDayInWeek(normalizedWeekStart));
  }, [pickRandomDayInWeek]);

  const shiftWeekPreview = useCallback((days: number) => {
    setWeekPreviewStart((current) => {
      const nextWeekStart = startOfWeekMonday(addDays(current, days));

      const nextYear = addDays(nextWeekStart, 3).getFullYear();
      setCalendarYear((year) => (year === nextYear ? year : nextYear));
      setDailyDate(pickRandomDayInWeek(nextWeekStart));
      return nextWeekStart;
    });
  }, [pickRandomDayInWeek]);

  const shiftDailyDate = useCallback((days: number) => {
    setDailyDate((current) => {
      const next = addDays(current, days);
      next.setHours(0, 0, 0, 0);
      setWeekPreviewStart(startOfWeekMonday(next));
      const nextYear = next.getFullYear();
      setCalendarYear((year) => (year === nextYear ? year : nextYear));
      return next;
    });
  }, []);

  const shiftCalendarYear = useCallback((years: number) => {
    setCalendarYear((year) => year + years);
    setWeekPreviewStart((current) => {
      const next = new Date(current);
      next.setFullYear(next.getFullYear() + years);
      return startOfWeekMonday(next);
    });
    setDailyDate((current) => {
      const next = new Date(current);
      next.setFullYear(next.getFullYear() + years);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const scoreValues = Object.values(dayScores);
    const finishedDays = scoreValues.filter((value) => value >= 100).length;
    const avgCompletion = scoreValues.length
      ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
      : 0;

    let weeklyStreak = 0;
    for (let index = weeks.length - 1; index >= 0; index -= 1) {
      const weekStart = weeks[index];
      const hasCompletedDay = Array.from({ length: 7 }).some((_, dayOffset) => {
        const key = toIsoDate(addDays(weekStart, dayOffset));
        return (dayScores[key] ?? 0) > 0;
      });

      if (hasCompletedDay) {
        weeklyStreak += 1;
        continue;
      }
      if (weeklyStreak > 0) break;
    }

    return {
      finishedDays,
      avgCompletion,
      weeklyStreak,
    };
  }, [dayScores, weeks]);

  const viewOptions = useMemo(
    () => [
      {
        id: "calendar" as const,
        title: "Goal Calendar",
        description: "Year overview",
        contextLabel: String(calendarYear),
        accentClass: "from-sky-500/30 via-cyan-500/10 to-transparent",
        icon: Calendar,
      },
      {
        id: "week" as const,
        title: "Week View",
        description: "Current week",
        contextLabel: weekPreviewMonthLabel,
        accentClass: "from-amber-500/30 via-orange-500/10 to-transparent",
        icon: Layers,
      },
      {
        id: "daily" as const,
        title: "Daily View",
        description: "Selected day",
        contextLabel: dailyDateLabel,
        accentClass: "from-emerald-500/30 via-lime-500/10 to-transparent",
        icon: NotebookPen,
      },
    ],
    [calendarYear, dailyDateLabel, weekPreviewMonthLabel]
  );

  const isFixedDesktopWorkspace = activeView === "calendar" || activeView === "week";

  useEffect(() => {
    if (!isFixedDesktopWorkspace) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [isFixedDesktopWorkspace]);

  const handleConfirmReplaceGoal = useCallback(async () => {
    if (!replaceDialog) return;

    const { dateKey, template, kind } = replaceDialog;
    setIsReplacingGoal(true);
    setCreatingDate(dateKey);

    try {
      if (kind === "day") {
        const created = await goalApi.replaceDayGoal({
          templateId: template.id,
          targetDate: dateKey,
        });
        const completeness = normalizeScore(created.completeness);
        setDayScores((prev) => ({
          ...prev,
          [created.targetDate]: Math.max(prev[created.targetDate] ?? 0, completeness),
        }));
        setLastActionText(
          `Goal "${template.name}" (${getGoalKindLabel(template.kind)}) replaced on ${toDisplayDate(
            created.targetDate
          )}`
        );
      } else {
        const created = await goalApi.replaceWeekGoal({
          templateId: template.id,
          targetDate: dateKey,
        });
        const weekStartKey =
          replaceDialog.weekStartKey ?? toIsoDate(startOfWeekMonday(fromIsoDate(dateKey)));
        setDayScores((prev) => mergeWeekScores(prev, created));
        setLastActionText(
          `Goal "${template.name}" (${getGoalKindLabel(
            template.kind
          )}) replaced for week from ${toDisplayDate(weekStartKey)}`
        );
      }

      await reloadAll();
    } finally {
      setIsReplacingGoal(false);
      setReplaceDialog(null);
      setCreatingDate(null);
    }
  }, [reloadAll, replaceDialog]);

  const handleDeleteDayGoalOnDate = useCallback(
    async (dateKey: string) => {
      if (draggingTemplate) return;
      if (eraserMode !== "eraseOn") return;

      if (!(dateKey in dayScores)) {
        setLastActionText(`No day goal found on ${toDisplayDate(dateKey)}`);
        return;
      }

      setIsDeletingGoal(true);
      setCreatingDate(dateKey);

      try {
        await goalApi.deleteDayGoal(dateKey);
        setLastActionText(`Day goal deleted on ${toDisplayDate(dateKey)}`);
        await reloadAll();
      } finally {
        setIsDeletingGoal(false);
        setCreatingDate(null);
      }
    },
    [dayScores, draggingTemplate, eraserMode, reloadAll]
  );

  const handleDeleteWeekGoalOnDate = useCallback(
    async (dateKey: string) => {
      if (draggingTemplate) return;
      if (eraserMode !== "eraseOn") return;

      const weekStart = startOfWeekMonday(fromIsoDate(dateKey));
      const weekHasGoal = Array.from({ length: 7 }, (_, dayOffset) =>
        toIsoDate(addDays(weekStart, dayOffset))
      ).some((weekDayKey) => weekDayKey in dayScores);

      if (!weekHasGoal) {
        setLastActionText(`No week goal found from ${toDisplayDate(toIsoDate(weekStart))}`);
        return;
      }

      const weekStartKey = toIsoDate(weekStart);
      setIsDeletingGoal(true);
      setCreatingDate(weekStartKey);

      try {
        await goalApi.deleteWeekGoal(weekStartKey);
        setLastActionText(`Week goal deleted from ${toDisplayDate(weekStartKey)}`);
        await reloadAll();
      } finally {
        setIsDeletingGoal(false);
        setCreatingDate(null);
      }
    },
    [dayScores, draggingTemplate, eraserMode, reloadAll]
  );

  const handleDeleteEntryGoal = useCallback(
    async (entryGoalId: number, entryName?: string | null) => {
      if (eraserMode !== "eraseOn") return;

      setIsDeletingGoal(true);
      try {
        await goalApi.deleteEntryGoal(entryGoalId);
        setLastActionText(`Entry goal "${entryName ?? entryGoalId}" deleted`);
        await reloadAll();
      } finally {
        setIsDeletingGoal(false);
      }
    },
    [eraserMode, reloadAll]
  );

  const handleConfirmDayGoal = useCallback(async (dayGoalId: number, dateKey: string) => {
    if (eraserMode === "eraseOn") return;

    setCreatingDate(dateKey);
    try {
      await goalApi.confirmDayGoal(dayGoalId);
      setLastActionText(`Day goal confirmed on ${toDisplayDate(dateKey)}`);
      await reloadAll();
    } finally {
      setCreatingDate(null);
    }
  }, [eraserMode, reloadAll]);

  const handleConfirmEntryGoal = useCallback(
    (entry: DiaryEntryGoalSummary, entryName: string) => {
      if (eraserMode === "eraseOn") return;
      if (!entry?.id) return;
      setEntryConfirmDialog({
        goalId: entry.id,
        entryName,
      });
    },
    [eraserMode]
  );

  const handleConfirmEntryGoalSimple = useCallback(
    async (entry: DiaryEntryGoalSummary, entryName: string) => {
      if (eraserMode === "eraseOn") return;
      if (!entry?.id) return;
      if (!userId) {
        setLastActionText("Unable to confirm entry goal: user is not authenticated");
        return;
      }
      setCreatingDate(dailyDateKey);

      try {
        await goalApi.confirmEntryGoalSimple(entry.id, userId);
        setLastActionText(`Entry goal "${entryName}" confirmed`);
        await reloadAll();
      } finally {
        setCreatingDate(null);
      }
    },
    [dailyDateKey, eraserMode, reloadAll, userId]
  );

  const handleSubmitEntryGoalConfirm = useCallback(
    async (goalId: number, payload: DiaryEntryCreate) => {
      if (!userId) {
        setLastActionText("Unable to confirm entry goal: user is not authenticated");
        throw new Error("User is not authenticated");
      }
      setCreatingDate(dailyDateKey);
      setIsSubmittingEntryConfirm(true);

      try {
        await goalApi.confirmEntryGoal(goalId, userId, payload);
        const entryLabel = entryConfirmDialog?.entryName ?? String(goalId);
        setLastActionText(`Entry goal "${entryLabel}" confirmed`);
        await reloadAll();
        setEntryConfirmDialog(null);
      } finally {
        setIsSubmittingEntryConfirm(false);
        setCreatingDate(null);
      }
    },
    [dailyDateKey, entryConfirmDialog?.entryName, reloadAll, userId]
  );

  const applyGoalToDate = useCallback(
    async (dateKey: string, template: DragTemplatePayload) => {
      if (eraserMode !== "eraseOff") return;
      setCreatingDate(dateKey);

      try {
        if (template.kind === "entry") {
          const created = await goalApi.createEntryGoal({
            templateId: template.id,
            targetDate: dateKey,
          });
          const completeness = normalizeScore(created.completeness);
          setDayScores((prev) => ({
            ...prev,
            [dateKey]: Math.max(prev[dateKey] ?? 0, completeness),
          }));
          setLastActionText("");
          toast.success(
            `Goal "${template.name}" (${getGoalKindLabel(template.kind)}) added for ${toDisplayDate(
              dateKey
            )}`
          );
          await reloadAll();
          return;
        }

        if (template.kind === "day") {
          const hasExistingGoal = dateKey in dayScores;
          if (hasExistingGoal) {
            setReplaceDialog({
              dateKey,
              template,
              kind: "day",
            });
            return;
          }

          const created = await goalApi.createDayGoal({
            templateId: template.id,
            targetDate: dateKey,
          });
          const completeness = normalizeScore(created.completeness);
          setDayScores((prev) => ({
            ...prev,
            [created.targetDate]: Math.max(prev[created.targetDate] ?? 0, completeness),
          }));
          setLastActionText("");
          toast.success(
            `Goal "${template.name}" (${getGoalKindLabel(
              template.kind
            )}) added for ${toDisplayDate(created.targetDate)}`
          );
          await reloadAll();
          return;
        }

        const weekStart = startOfWeekMonday(fromIsoDate(dateKey));
        const weekDateKeys = Array.from({ length: 7 }, (_, dayOffset) =>
          toIsoDate(addDays(weekStart, dayOffset))
        );
        const hasExistingGoal = weekDateKeys.some((weekDayKey) => weekDayKey in dayScores);
        if (hasExistingGoal) {
          setReplaceDialog({
            dateKey,
            template,
            kind: "week",
            weekStartKey: toIsoDate(weekStart),
          });
          return;
        }

        const created = await goalApi.createWeekGoal({
          templateId: template.id,
          targetDate: dateKey,
        });
        setDayScores((prev) => mergeWeekScores(prev, created));
        setLastActionText("");
        toast.success(
          `Goal "${template.name}" (${getGoalKindLabel(template.kind)}) added for week from ${toDisplayDate(
            dateKey
          )}`
        );
        await reloadAll();
      } finally {
        setCreatingDate(null);
      }
    },
    [dayScores, eraserMode, reloadAll]
  );

  const stopCustomDrag = useCallback(() => {
    setDraggingTemplate(null);
    setDragPointer(null);
    setHoverDate(null);
  }, []);

  useEffect(() => {
    if (!draggingTemplate) return;

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    const handlePointerMove = (event: PointerEvent) => {
      setDragPointer({ x: event.clientX, y: event.clientY });
      setHoverDate(getDateKeyAtPoint(event.clientX, event.clientY));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const dropDate = getDateKeyAtPoint(event.clientX, event.clientY) ?? hoverDateRef.current;

      if (dropDate && isDateInRange(fromIsoDate(dropDate), yearStart, yearEnd)) {
        void applyGoalToDate(dropDate, draggingTemplate);
      }

      stopCustomDrag();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stopCustomDrag();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [applyGoalToDate, draggingTemplate, stopCustomDrag, yearEnd, yearStart]);

  const handleTemplatePointerDown = (
    template: TemplateItem,
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (eraserMode !== "eraseOff" || isDeletingGoal) return;
    if (event.button !== 0) return;

    event.preventDefault();
    setDraggingTemplate({
      id: template.id,
      name: template.name,
      kind: template.kind,
    });
    setDragPointer({ x: event.clientX, y: event.clientY });
    setHoverDate(null);
  };

  const isDailyPreviewTarget = previewDateKeys.has(dailyDateKey);
  const canDropOnDailyDate = isDateInRange(dailyDate, yearStart, yearEnd);
  const weekPreviewStartKey = useMemo(
    () => toIsoDate(startOfWeekMonday(weekPreviewStart)),
    [weekPreviewStart]
  );

  const replaceDialogDescription = useMemo(() => {
    if (!replaceDialog) return "";

    if (replaceDialog.kind === "day") {
      return `A day or week goal already exists on ${toDisplayDate(
        replaceDialog.dateKey
      )}. Do you want to replace it with "${replaceDialog.template.name}"?`;
    }

    const weekStartKey =
      replaceDialog.weekStartKey ?? toIsoDate(startOfWeekMonday(fromIsoDate(replaceDialog.dateKey)));
    return `A day or week goal already exists in week starting ${toDisplayDate(
      weekStartKey
    )}. Do you want to replace it with "${replaceDialog.template.name}"?`;
  }, [replaceDialog]);

  return (
    <div
      className={cn(
        "w-full bg-page text-foreground p-4 sm:p-6 lg:p-8",
        isFixedDesktopWorkspace
          ? "min-h-screen pb-20 sm:pb-24 xl:h-[calc(100vh-56px)] xl:min-h-0 xl:overflow-hidden xl:pb-4"
          : "min-h-screen pb-20 sm:pb-24 lg:pb-4"
      )}
    >
      {draggingTemplate && dragPointer && (
        <GoalsDragPreview x={dragPointer.x} y={dragPointer.y} canDrop={canDropAtPointer} />
      )}

      <div
        className={cn(
          "w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_17em] xl:items-start",
          isFixedDesktopWorkspace &&
            "xl:h-[calc(100vh-87px-16px)] xl:max-h-[calc(100vh-87px-16px)] xl:overflow-hidden"
        )}
      >
        <div
          className={cn(
            "w-full min-w-0 space-y-6",
            isFixedDesktopWorkspace && "xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:space-y-0"
          )}
        >
          <Tabs
            value={activeView}
            onValueChange={(value) => {
              if (isGoalsWorkspaceView(value)) {
                handleViewChange(value);
              }
            }}
            className={cn(isFixedDesktopWorkspace && "xl:flex xl:h-full xl:min-h-0 xl:flex-col")}
          >
            <Card
              className={cn(
                "overflow-hidden border-border/70 bg-background/80 shadow-sm",
                isFixedDesktopWorkspace && "xl:mb-6 xl:shrink-0"
              )}
            >
              <CardHeader className="gap-4 pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <Badge
                      variant="outline"
                      className="inline-flex w-fit items-center gap-2 rounded-full border-border/60 bg-background px-4 py-2 text-[11px] uppercase tracking-[0.24em]"
                    >
                      <Target className="h-4 w-4" />
                      Goals Workspace
                    </Badge>

                    <div className="space-y-1">
                      <CardTitle className="text-2xl">Goals planning board</CardTitle>
                      <CardDescription className="max-w-2xl">
                        Keep the current layout, but switch between yearly, weekly and daily
                        planning with shadcn-style controls.
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      Year {calendarYear}
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {stats.finishedDays} finished
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {stats.avgCompletion}% avg
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {stats.weeklyStreak} streak
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {lastActionText ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-foreground">
                    {lastActionText}
                  </div>
                ) : null}

                <TabsList className="grid h-auto w-full grid-cols-1 gap-3 rounded-[28px] bg-surface/40 p-2 lg:grid-cols-3">
                  {viewOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = option.id === activeView;

                    return (
                      <TabsTrigger
                        key={option.id}
                        value={option.id}
                        className={cn(
                          "group relative h-auto min-h-[112px] items-start overflow-hidden rounded-[24px] border border-border/70 bg-background p-4 text-left shadow-sm hover:border-border hover:bg-surface/60",
                          "data-[state=active]:border-foreground/10 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-data-[state=active]:opacity-100",
                            option.accentClass
                          )}
                        />

                        <div className="relative flex w-full flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                                  isActive
                                    ? "border-white/15 bg-white/10 text-white"
                                    : "border-border bg-surface text-foreground"
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>

                              <div className="truncate text-base font-semibold">{option.title}</div>
                            </div>

                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]",
                                isActive
                                  ? "border-white/15 bg-white/10 text-white/85"
                                  : "border-border/70 bg-surface text-muted-foreground"
                              )}
                            >
                              {option.contextLabel}
                            </Badge>
                          </div>

                          <div
                            className={cn(
                              "text-sm",
                              isActive ? "text-white/70" : "text-muted-foreground"
                            )}
                          >
                            {option.description}
                          </div>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </CardContent>
            </Card>

            {activeView === "calendar" ? (
              <div className={cn(isFixedDesktopWorkspace && "xl:min-h-0 xl:flex-1 xl:overflow-hidden")}>
                <GoalCalendarCard
                  className={cn(isFixedDesktopWorkspace && "xl:h-full")}
                  calendarYear={calendarYear}
                  onPrevYear={() => shiftCalendarYear(-1)}
                  onNextYear={() => shiftCalendarYear(1)}
                  stats={stats}
                  lastActionText=""
                  weeks={weeks}
                  monthLabels={monthLabels}
                  yearStart={yearStart}
                  yearEnd={yearEnd}
                  dayScores={dayScores}
                  weekScores={weekScores}
                  previewDateKeys={previewDateKeys}
                  draggingTemplate={Boolean(draggingTemplate)}
                  creatingDate={creatingDate}
                  isEraserOn={isEraserOn}
                  selectedDayKey={dailyDateKey}
                  weekPreviewStartKey={weekPreviewStartKey}
                  onHoverDate={setHoverDate}
                  onDeleteDayGoal={(dateKey) => {
                    void handleDeleteDayGoalOnDate(dateKey);
                  }}
                  onDeleteWeekGoal={(dateKey) => {
                    void handleDeleteWeekGoalOnDate(dateKey);
                  }}
                  onSelectDay={setDailyDateWithSync}
                  onSelectWeek={setWeekPreviewWithSync}
                />
              </div>
            ) : null}

            {activeView === "week" ? (
              <div className={cn(isFixedDesktopWorkspace && "xl:min-h-0 xl:flex-1 xl:overflow-hidden")}>
                <WeekViewCard
                  className={cn(isFixedDesktopWorkspace && "xl:h-full")}
                  monthLabel={weekPreviewMonthLabel}
                  stats={weekPreviewStats}
                  days={weekPreviewDays}
                  dailyDateKey={dailyDateKey}
                  previewDateKeys={previewDateKeys}
                  draggingTemplate={Boolean(draggingTemplate)}
                  creatingDate={creatingDate}
                  isEraserOn={isEraserOn}
                  onPrevWeek={() => shiftWeekPreview(-7)}
                  onNextWeek={() => shiftWeekPreview(7)}
                  onHoverDate={setHoverDate}
                  onSelectDailyDate={setDailyDateWithSync}
                  onConfirmDayGoal={(dayGoalId, dateKey) => {
                    void handleConfirmDayGoal(dayGoalId, dateKey);
                  }}
                  onDeleteDayGoal={(dateKey) => {
                    void handleDeleteDayGoalOnDate(dateKey);
                  }}
                />
              </div>
            ) : null}

            {activeView === "daily" ? (
              <DailyViewCard
                dailyDateLabel={dailyDateLabel}
                dailyDateKey={dailyDateKey}
                currentDayGoalId={dayGoalIdsByDate[dailyDateKey] ?? null}
                dailyEntries={dailyEntries}
                isLoadingDailyEntries={isLoadingDailyEntries}
                isDailyPreviewTarget={isDailyPreviewTarget}
                canDropOnDailyDate={canDropOnDailyDate}
                draggingTemplate={Boolean(draggingTemplate)}
                creatingDate={creatingDate}
                isEraserOn={isEraserOn}
                onPrevDay={() => shiftDailyDate(-1)}
                onNextDay={() => shiftDailyDate(1)}
                onHoverDate={setHoverDate}
                onDeleteDayGoal={(dateKey) => {
                  void handleDeleteDayGoalOnDate(dateKey);
                }}
                onDeleteEntryGoal={(entryGoalId, entryName) => {
                  void handleDeleteEntryGoal(entryGoalId, entryName);
                }}
                onConfirmDayGoal={(dayGoalId) => {
                  void handleConfirmDayGoal(dayGoalId, dailyDateKey);
                }}
                onConfirmEntryGoal={(entry, entryName) => {
                  void handleConfirmEntryGoal(entry, entryName);
                }}
                onConfirmEntryGoalSimple={(entry, entryName) => {
                  void handleConfirmEntryGoalSimple(entry, entryName);
                }}
              />
            ) : null}
          </Tabs>
        </div>

        <TemplatesSidebar
          eraserMode={eraserMode}
          isLoadingTemplates={isLoadingTemplates}
          filteredTemplates={filteredTemplates}
          filterKind={filterKind}
          filterName={filterName}
          draggingTemplate={draggingTemplate}
          entryGoals={dailyEntries}
          entryDateLabel={dailyDateLabel}
          onEraserModeChange={setEraserMode}
          onFilterKindChange={setFilterKind}
          onFilterNameChange={setFilterName}
          onRefreshTemplates={() => {
            void loadTemplates();
          }}
          onTemplatePointerDown={handleTemplatePointerDown}
        />
      </div>

      <ReplaceGoalDialog
        open={Boolean(replaceDialog)}
        description={replaceDialogDescription}
        isReplacing={isReplacingGoal}
        onOpenChange={(open) => {
          if (!open && !isReplacingGoal) {
            setReplaceDialog(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmReplaceGoal();
        }}
      />

      <ConfirmEntryGoalDialogV2
        open={Boolean(entryConfirmDialog)}
        goalId={entryConfirmDialog?.goalId ?? null}
        entryName={entryConfirmDialog?.entryName ?? ""}
        isSubmitting={isSubmittingEntryConfirm}
        onOpenChange={(open) => {
          if (!open && !isSubmittingEntryConfirm) {
            setEntryConfirmDialog(null);
          }
        }}
        onSubmit={handleSubmitEntryGoalConfirm}
      />
    </div>
  );
}
