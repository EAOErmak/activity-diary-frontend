import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  startTransition,
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
import { TemplatesSidebarV2 as TemplatesSidebar } from "@/features/goals/components/TemplatesSidebarV2";
import { WeekViewCard } from "@/features/goals/components/WeekViewCard";
import { useConfirmDayGoalMutation } from "@/features/goals/hooks/useConfirmDayGoalMutation";
import { useGoalCalendarGrid } from "@/features/goals/hooks/useGoalCalendarGrid";
import { useGoalsSummaries } from "@/features/goals/hooks/useGoalsSummaries";
import { useGoalsTemplates } from "@/features/goals/hooks/useGoalsTemplates";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
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
  startOfWeekMonday,
  toDisplayDate,
  toIsoDate,
} from "@/features/goals/lib/goalsUtils";
import { goalKeys } from "@/shared/lib/queryKeys";
import { cn } from "@/shared/lib/utils";
import type { DiaryEntryCreate } from "@/shared/types/diary";
import type {
  DiaryEntryGoalSummary,
  DiaryEntryGoalView,
  WeekGoalView,
} from "@/shared/types/goal";
import { useCurrentUserStore } from "@/shared/store/currentUserStore";

type PointerPosition = {
  x: number;
  y: number;
};

type EntryConfirmDialogState = {
  goalId: number;
  entryName: string;
};

type GoalsWorkspaceView = "calendar" | "week" | "daily";
const DROP_INTERACTION_SUPPRESS_MS = 250;
const GOAL_MUTATION_IN_PROGRESS_MESSAGE = "Wait for the current goal update to finish.";

const isGoalsWorkspaceView = (value: string | null): value is GoalsWorkspaceView =>
  value === "calendar" || value === "week" || value === "daily";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const getWeekDateKeys = (weekStart: Date): string[] =>
  Array.from({ length: 7 }, (_, dayOffset) => toIsoDate(addDays(weekStart, dayOffset)));

const buildPreviewDateKeys = (
  hoverDate: string | null,
  draggingTemplate: DragTemplatePayload | null
): Set<string> => {
  if (!hoverDate || !draggingTemplate) return new Set<string>();
  if (draggingTemplate.kind !== "week") return new Set<string>([hoverDate]);

  const hoveredDate = fromIsoDate(hoverDate);
  const monday = startOfWeekMonday(hoveredDate);
  const weekKeys = new Set<string>();

  for (let offset = 0; offset < 7; offset += 1) {
    weekKeys.add(toIsoDate(addDays(monday, offset)));
  }

  return weekKeys;
};

function sortDailyEntries(entries: DiaryEntryGoalSummary[]) {
  return [...entries].sort((left, right) => {
    const leftTime = left.whenStarted
      ? new Date(left.whenStarted).getTime()
      : Number.MAX_SAFE_INTEGER;
    const rightTime = right.whenStarted
      ? new Date(right.whenStarted).getTime()
      : Number.MAX_SAFE_INTEGER;

    return leftTime - rightTime;
  });
}

function toDailyEntrySummary(entry: DiaryEntryGoalView): DiaryEntryGoalSummary {
  return {
    id: entry.id,
    name: entry.name,
    whenStarted: entry.whenStarted,
    whenEnded: entry.whenEnded,
    mood: entry.mood,
    description: entry.description,
    completeness: entry.completeness,
    currentEntryId: entry.currentEntryId,
  };
}

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterKind, setFilterKind] = useState<TemplateFilterKind>("all");
  const [filterName, setFilterName] = useState("");
  const [draggingTemplate, setDraggingTemplate] = useState<DragTemplatePayload | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [replaceDialog, setReplaceDialog] = useState<ReplaceGoalDialogState | null>(null);
  const [isReplacingGoal, setIsReplacingGoal] = useState(false);
  const [eraserMode, setEraserMode] = useState<EraserMode>("eraseOff");
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [entryConfirmDialog, setEntryConfirmDialog] = useState<EntryConfirmDialogState | null>(
    null
  );
  const [isSubmittingEntryConfirm, setIsSubmittingEntryConfirm] = useState(false);
  const currentUserId = useCurrentUserStore((state) => state.user?.id ?? null);
  const viewParam = searchParams.get("view");
  const activeView: GoalsWorkspaceView = isGoalsWorkspaceView(viewParam)
    ? viewParam
    : "calendar";
  const isEraserOn = eraserMode === "eraseOn";

  const hoverDateRef = useRef<string | null>(null);
  const dragPointerRef = useRef<PointerPosition | null>(null);
  const dragPointerRafRef = useRef<number | null>(null);
  const calendarPreviewKeysRef = useRef<Set<string>>(new Set());
  const suppressPostDropInteractionUntilRef = useRef(0);
  const goalMutationLockRef = useRef(false);
  useEffect(() => {
    hoverDateRef.current = hoverDate;
  }, [hoverDate]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [calendarYear, setCalendarYear] = useState(currentYear);
  const { yearStart, yearEnd, weeks, monthLabels, calendarFrom, calendarTo } =
    useGoalCalendarGrid(calendarYear);

  const updateDragPreviewPosition = useCallback((x: number, y: number) => {
    document.documentElement.style.setProperty("--goals-drag-x", `${x}px`);
    document.documentElement.style.setProperty("--goals-drag-y", `${y}px`);
  }, []);

  const clearDragPreviewPosition = useCallback(() => {
    document.documentElement.style.removeProperty("--goals-drag-x");
    document.documentElement.style.removeProperty("--goals-drag-y");
  }, []);

  const updateDragPreviewTone = useCallback((canDrop: boolean) => {
    document.documentElement.style.setProperty("--goals-drag-bg", canDrop ? "#3b82f6" : "#ef4444");
    document.documentElement.style.setProperty(
      "--goals-drag-border",
      canDrop ? "#bfdbfe" : "#fecaca"
    );
    document.documentElement.style.setProperty(
      "--goals-drag-shadow",
      canDrop
        ? "0 0 0 2px rgba(59,130,246,0.45)"
        : "0 0 0 2px rgba(239,68,68,0.45)"
    );
  }, []);

  const clearDragPreviewTone = useCallback(() => {
    document.documentElement.style.removeProperty("--goals-drag-bg");
    document.documentElement.style.removeProperty("--goals-drag-border");
    document.documentElement.style.removeProperty("--goals-drag-shadow");
  }, []);

  const setCalendarPreviewCellState = useCallback(
    (dateKey: string, active: boolean) => {
      const cell = document.querySelector<HTMLElement>(`[data-goal-date="${dateKey}"]`);
      if (!cell) return;

      if (!active) {
        if (cell.dataset.previewApplied !== "true") return;
        cell.style.backgroundColor = cell.dataset.previewBg ?? "";
        cell.style.borderColor = cell.dataset.previewBorderColor ?? "";
        cell.style.boxShadow = cell.dataset.previewBoxShadow ?? "";
        delete cell.dataset.previewApplied;
        delete cell.dataset.previewBg;
        delete cell.dataset.previewBorderColor;
        delete cell.dataset.previewBoxShadow;
        return;
      }

      const canDropOnDate = isDateInRange(fromIsoDate(dateKey), yearStart, yearEnd);
      if (cell.dataset.previewApplied !== "true") {
        cell.dataset.previewBg = cell.style.backgroundColor ?? "";
        cell.dataset.previewBorderColor = cell.style.borderColor ?? "";
        cell.dataset.previewBoxShadow = cell.style.boxShadow ?? "";
      }

      cell.dataset.previewApplied = "true";
      cell.style.backgroundColor = canDropOnDate ? "#3b82f6" : "#ef4444";
      cell.style.borderColor = canDropOnDate ? "#bfdbfe" : "#fecaca";
      cell.style.boxShadow = canDropOnDate
        ? "0 0 0 2px rgba(59,130,246,0.45)"
        : "0 0 0 2px rgba(239,68,68,0.45)";
    },
    [yearEnd, yearStart]
  );

  const syncCalendarPreview = useCallback(
    (nextKeys: Set<string>) => {
      const prevKeys = calendarPreviewKeysRef.current;

      prevKeys.forEach((dateKey) => {
        if (!nextKeys.has(dateKey)) {
          setCalendarPreviewCellState(dateKey, false);
        }
      });

      nextKeys.forEach((dateKey) => {
        if (!prevKeys.has(dateKey)) {
          setCalendarPreviewCellState(dateKey, true);
        }
      });

      calendarPreviewKeysRef.current = nextKeys;
    },
    [setCalendarPreviewCellState]
  );

  const clearCalendarPreview = useCallback(() => {
    syncCalendarPreview(new Set<string>());
  }, [syncCalendarPreview]);

  const suppressPostDropInteractions = useCallback(() => {
    suppressPostDropInteractionUntilRef.current = Date.now() + DROP_INTERACTION_SUPPRESS_MS;
  }, []);

  const shouldIgnorePostDropInteraction = useCallback(
    () => Date.now() < suppressPostDropInteractionUntilRef.current,
    []
  );

  const scheduleDragUpdate = useCallback(
    (x: number, y: number) => {
      dragPointerRef.current = { x, y };
      if (dragPointerRafRef.current !== null) return;

      dragPointerRafRef.current = window.requestAnimationFrame(() => {
        dragPointerRafRef.current = null;
        const pointer = dragPointerRef.current;
        if (!pointer) return;

        updateDragPreviewPosition(pointer.x, pointer.y);
        const nextHoverDate = getDateKeyAtPoint(pointer.x, pointer.y);
        const nextCanDrop =
          nextHoverDate !== null && isDateInRange(fromIsoDate(nextHoverDate), yearStart, yearEnd);

        updateDragPreviewTone(nextCanDrop);

        if (activeView === "calendar") {
          hoverDateRef.current = nextHoverDate;
          syncCalendarPreview(buildPreviewDateKeys(nextHoverDate, draggingTemplate));
          return;
        }

        clearCalendarPreview();
        if (hoverDateRef.current !== nextHoverDate) {
          hoverDateRef.current = nextHoverDate;
          startTransition(() => {
            setHoverDate(nextHoverDate);
          });
        }
      });
    },
    [
      activeView,
      clearCalendarPreview,
      draggingTemplate,
      syncCalendarPreview,
      updateDragPreviewPosition,
      yearEnd,
      yearStart,
    ]
  );

  const [weekPreviewStart, setWeekPreviewStart] = useState(() => startOfWeekMonday(new Date()));
  const [dailyDate, setDailyDate] = useState(() => {
    const next = new Date();
    next.setHours(0, 0, 0, 0);
    return next;
  });

  const dailyDateKey = useMemo(() => toIsoDate(dailyDate), [dailyDate]);
  const dailyDateLabel = useMemo(() => formatDailyDate(dailyDate), [dailyDate]);
  const todayKey = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return toIsoDate(today);
  }, []);

  const { isLoadingTemplates, templateItems, loadTemplates } = useGoalsTemplates();
  const {
    dayScores,
    dayGoalIdsByDate,
    dayGoalConfirmedByDate,
    weekScores,
    dailyEntries,
    isLoadingDailyEntries,
    reloadAll,
  } = useGoalsSummaries({
    calendarFrom,
    calendarTo,
    dailyDateKey,
  });
  const {
    mutateAsync: confirmDayGoalMutation,
    isPendingDayGoal,
  } = useConfirmDayGoalMutation();

  const beginGoalMutation = useCallback(() => {
    if (goalMutationLockRef.current) {
      return false;
    }

    goalMutationLockRef.current = true;
    return true;
  }, []);

  const endGoalMutation = useCallback(() => {
    goalMutationLockRef.current = false;
  }, []);

  const reportGoalMutationError = useCallback((error: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(error)) return;
    toast.error(getErrorMessage(error, fallbackMessage));
  }, []);

  const invalidateGoalOverviewQueries = useCallback(
    async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: goalKeys.daySummaries() }),
        queryClient.invalidateQueries({ queryKey: goalKeys.weekSummaries() }),
      ]),
    [queryClient]
  );

  const syncSelectedDailyEntries = useCallback(
    (dateKey: string, entries: DiaryEntryGoalView[]) => {
      if (dateKey !== dailyDateKey) {
        return;
      }

      queryClient.setQueryData<DiaryEntryGoalSummary[]>(
        goalKeys.dailyEntriesByDate(dateKey),
        sortDailyEntries(entries.map(toDailyEntrySummary))
      );
    },
    [dailyDateKey, queryClient]
  );

  const appendSelectedDailyEntry = useCallback(
    (dateKey: string, entry: DiaryEntryGoalView) => {
      if (dateKey !== dailyDateKey) {
        return;
      }

      queryClient.setQueryData<DiaryEntryGoalSummary[]>(
        goalKeys.dailyEntriesByDate(dateKey),
        (current) =>
          sortDailyEntries([
            ...(current ?? []).filter((existingEntry) => existingEntry.id !== entry.id),
            toDailyEntrySummary(entry),
          ])
      );
    },
    [dailyDateKey, queryClient]
  );

  const syncSelectedWeekGoalEntries = useCallback(
    (weekGoal: WeekGoalView) => {
      const selectedDay = weekGoal.days.find((day) => day.targetDate === dailyDateKey);
      if (!selectedDay) {
        return;
      }

      syncSelectedDailyEntries(selectedDay.targetDate, selectedDay.entries);
    },
    [dailyDateKey, syncSelectedDailyEntries]
  );

  useEffect(() => {
    setHoverDate(null);
    hoverDateRef.current = null;
    clearCalendarPreview();
    clearDragPreviewTone();
  }, [calendarYear, clearCalendarPreview, clearDragPreviewTone]);

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
    if (activeView === "calendar") return new Set<string>();
    return buildPreviewDateKeys(hoverDate, draggingTemplate);
  }, [activeView, draggingTemplate, hoverDate]);

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
      const isConfirmed = dayGoalConfirmedByDate[dateKey] ?? false;

      return {
        date,
        dateKey,
        label: WEEKDAY_FULL_LABELS[index],
        isInYear,
        hasScore,
        score,
        dayGoalId,
        isConfirmed,
      };
    });
  }, [dayGoalConfirmedByDate, dayGoalIdsByDate, dayScores, weekPreviewStart, yearEnd, yearStart]);

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

  const isFixedDesktopWorkspace =
    activeView === "calendar" || activeView === "week" || activeView === "daily";

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
    if (!beginGoalMutation()) {
      toast.warning(GOAL_MUTATION_IN_PROGRESS_MESSAGE);
      return;
    }

    setIsReplacingGoal(true);
    setCreatingDate(dateKey);

    try {
      if (kind === "day") {
        const created = await goalApi.replaceDayGoal({
          templateId: template.id,
          targetDate: dateKey,
        });
        syncSelectedDailyEntries(created.targetDate, created.entries);
        await invalidateGoalOverviewQueries();
        toast.success(`Day goal confirmed on ${toDisplayDate(created.targetDate)}`);
      } else {
        const created = await goalApi.replaceWeekGoal({
          templateId: template.id,
          targetDate: dateKey,
        });
        const weekStartKey =
          replaceDialog.weekStartKey ?? toIsoDate(startOfWeekMonday(fromIsoDate(dateKey)));
        syncSelectedWeekGoalEntries(created);
        await invalidateGoalOverviewQueries();
        toast.success(`Week goal confirmed from ${toDisplayDate(weekStartKey)}`);
      }
    } catch (error) {
      reportGoalMutationError(error, "Failed to replace the goal");
    } finally {
      endGoalMutation();
      setIsReplacingGoal(false);
      setReplaceDialog(null);
      setCreatingDate(null);
    }
  }, [
    beginGoalMutation,
    endGoalMutation,
    invalidateGoalOverviewQueries,
    replaceDialog,
    reportGoalMutationError,
    syncSelectedDailyEntries,
    syncSelectedWeekGoalEntries,
  ]);

  const handleDeleteDayGoalOnDate = useCallback(
    async (dateKey: string) => {
      if (draggingTemplate) return;
      if (eraserMode !== "eraseOn") return;

      if (!(dateKey in dayScores)) {
        toast.warning(`No day goal found on ${toDisplayDate(dateKey)}`);
        return;
      }

      setIsDeletingGoal(true);
      setCreatingDate(dateKey);

      try {
        await goalApi.deleteDayGoal(dateKey);
        toast.success(`Day goal deleted on ${toDisplayDate(dateKey)}`);
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
        toast.warning(`No week goal found from ${toDisplayDate(toIsoDate(weekStart))}`);
        return;
      }

      const weekStartKey = toIsoDate(weekStart);
      setIsDeletingGoal(true);
      setCreatingDate(weekStartKey);

      try {
        await goalApi.deleteWeekGoal(weekStartKey);
        toast.success(`Week goal deleted from ${toDisplayDate(weekStartKey)}`);
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
        toast.success(`Entry goal "${entryName ?? entryGoalId}" deleted`);
        await reloadAll();
      } finally {
        setIsDeletingGoal(false);
      }
    },
    [eraserMode, reloadAll]
  );

  const handleConfirmDayGoal = useCallback(
    async (dayGoalId: number, dateKey: string) => {
      if (eraserMode === "eraseOn") return;
      if (!dayGoalId) return;
      if (dayGoalIdsByDate[dateKey] !== dayGoalId) return;
      if (dayGoalConfirmedByDate[dateKey]) return;
      if (isPendingDayGoal(dayGoalId)) return;

      if (isDeletingGoal || isReplacingGoal || isSubmittingEntryConfirm) {
        toast.warning(GOAL_MUTATION_IN_PROGRESS_MESSAGE);
        return;
      }

      if (!beginGoalMutation()) {
        toast.warning(GOAL_MUTATION_IN_PROGRESS_MESSAGE);
        return;
      }

      setCreatingDate(dateKey);
      try {
        await confirmDayGoalMutation({ dayGoalId, dateKey });
        toast.success(`Day goal confirmed on ${toDisplayDate(dateKey)}`);
      } catch (error) {
        reportGoalMutationError(error, "Failed to confirm the day goal");
      } finally {
        endGoalMutation();
        setCreatingDate(null);
      }
    },
    [
      beginGoalMutation,
      confirmDayGoalMutation,
      dayGoalConfirmedByDate,
      dayGoalIdsByDate,
      endGoalMutation,
      eraserMode,
      isDeletingGoal,
      isPendingDayGoal,
      isReplacingGoal,
      isSubmittingEntryConfirm,
      reportGoalMutationError,
    ]
  );

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
      if (!currentUserId) {
        toast.error("Unable to confirm entry goal: current user is unavailable");
        return;
      }
      setCreatingDate(dailyDateKey);

      try {
        await goalApi.confirmEntryGoalSimple(entry.id, currentUserId);
        toast.success(`Entry goal "${entryName}" confirmed`);
        await reloadAll();
      } finally {
        setCreatingDate(null);
      }
    },
    [currentUserId, dailyDateKey, eraserMode, reloadAll]
  );

  const handleSubmitEntryGoalConfirm = useCallback(
    async (goalId: number, payload: DiaryEntryCreate) => {
      if (!currentUserId) {
        toast.error("Unable to confirm entry goal: current user is unavailable");
        throw new Error("Current user is unavailable");
      }
      setCreatingDate(dailyDateKey);
      setIsSubmittingEntryConfirm(true);

      try {
        await goalApi.confirmEntryGoal(goalId, currentUserId, payload);
        const entryLabel = entryConfirmDialog?.entryName ?? String(goalId);
        toast.success(`Entry goal "${entryLabel}" confirmed`);
        await reloadAll();
        setEntryConfirmDialog(null);
      } finally {
        setIsSubmittingEntryConfirm(false);
        setCreatingDate(null);
      }
    },
    [currentUserId, dailyDateKey, entryConfirmDialog?.entryName, reloadAll]
  );

  const applyGoalToDate = useCallback(
    async (dateKey: string, template: DragTemplatePayload) => {
      if (eraserMode !== "eraseOff") return;
      let hasMutationLock = false;

      try {
        if (template.kind === "entry") {
          if (!beginGoalMutation()) {
            toast.warning(GOAL_MUTATION_IN_PROGRESS_MESSAGE);
            return;
          }

          hasMutationLock = true;
          setCreatingDate(dateKey);
          const created = await goalApi.createEntryGoal({
            templateId: template.id,
            targetDate: dateKey,
          });
          appendSelectedDailyEntry(dateKey, created);
          await invalidateGoalOverviewQueries();
          toast.success(`Entry goal created on ${toDisplayDate(dateKey)}`);
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

          if (!beginGoalMutation()) {
            toast.warning(GOAL_MUTATION_IN_PROGRESS_MESSAGE);
            return;
          }

          hasMutationLock = true;
          setCreatingDate(dateKey);
          const created = await goalApi.createDayGoal({
            templateId: template.id,
            targetDate: dateKey,
          });
          syncSelectedDailyEntries(created.targetDate, created.entries);
          await invalidateGoalOverviewQueries();
          toast.success(`Day goal confirmed on ${toDisplayDate(created.targetDate)}`);
          return;
        }

        const weekStart = startOfWeekMonday(fromIsoDate(dateKey));
        const weekDateKeys = getWeekDateKeys(weekStart);
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

        if (!beginGoalMutation()) {
          toast.warning(GOAL_MUTATION_IN_PROGRESS_MESSAGE);
          return;
        }

        hasMutationLock = true;
        setCreatingDate(dateKey);
        const created = await goalApi.createWeekGoal({
          templateId: template.id,
          targetDate: dateKey,
        });
        syncSelectedWeekGoalEntries(created);
        await invalidateGoalOverviewQueries();
        toast.success(
          `Week goal confirmed from ${toDisplayDate(
            toIsoDate(startOfWeekMonday(fromIsoDate(dateKey)))
          )}`
        );
      } catch (error) {
        reportGoalMutationError(error, "Failed to create the goal");
      } finally {
        if (hasMutationLock) {
          endGoalMutation();
          setCreatingDate(null);
        }
      }
    },
    [
      appendSelectedDailyEntry,
      beginGoalMutation,
      dayScores,
      endGoalMutation,
      eraserMode,
      invalidateGoalOverviewQueries,
      reportGoalMutationError,
      syncSelectedDailyEntries,
      syncSelectedWeekGoalEntries,
    ]
  );

  const stopCustomDrag = useCallback(() => {
    setDraggingTemplate(null);
    dragPointerRef.current = null;
    if (dragPointerRafRef.current !== null) {
      window.cancelAnimationFrame(dragPointerRafRef.current);
      dragPointerRafRef.current = null;
    }
    setHoverDate(null);
    hoverDateRef.current = null;
    clearCalendarPreview();
    clearDragPreviewPosition();
    clearDragPreviewTone();
  }, [clearCalendarPreview, clearDragPreviewPosition, clearDragPreviewTone]);

  useEffect(() => {
    if (!draggingTemplate) return;

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    const handlePointerMove = (event: PointerEvent) => {
      scheduleDragUpdate(event.clientX, event.clientY);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const dropDate = getDateKeyAtPoint(event.clientX, event.clientY) ?? hoverDateRef.current;

      if (dropDate && isDateInRange(fromIsoDate(dropDate), yearStart, yearEnd)) {
        suppressPostDropInteractions();
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
  }, [
    applyGoalToDate,
    draggingTemplate,
    scheduleDragUpdate,
    stopCustomDrag,
    suppressPostDropInteractions,
    yearEnd,
    yearStart,
  ]);

  const handleTemplatePointerDown = (
    template: TemplateItem,
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (eraserMode !== "eraseOff" || isDeletingGoal || isReplacingGoal || goalMutationLockRef.current) {
      return;
    }
    if (event.button !== 0) return;

    event.preventDefault();
    setDraggingTemplate({
      id: template.id,
      name: template.name,
      kind: template.kind,
    });
    updateDragPreviewPosition(event.clientX, event.clientY);
    dragPointerRef.current = { x: event.clientX, y: event.clientY };
    updateDragPreviewTone(false);
    setHoverDate(null);
    hoverDateRef.current = null;
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
      {draggingTemplate ? <GoalsDragPreview /> : null}

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
                "mb-6 overflow-hidden border-border/70 bg-background/80 shadow-sm",
                isFixedDesktopWorkspace && "xl:shrink-0"
              )}
            >
              <CardHeader className="gap-4 pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className="inline-flex w-fit items-center gap-2 rounded-full border-border/60 bg-background px-4 py-2 text-[11px] uppercase tracking-[0.24em]"
                    >
                      <Target className="h-4 w-4" />
                      Goals Workspace
                    </Badge>
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
                  todayKey={todayKey}
                  onPrevYear={() => shiftCalendarYear(-1)}
                  onNextYear={() => shiftCalendarYear(1)}
                  stats={stats}
                  weeks={weeks}
                  monthLabels={monthLabels}
                  yearStart={yearStart}
                  yearEnd={yearEnd}
                  dayScores={dayScores}
                  dayGoalIdsByDate={dayGoalIdsByDate}
                  dayGoalConfirmedByDate={dayGoalConfirmedByDate}
                  weekScores={weekScores}
                  previewDateKeys={previewDateKeys}
                  draggingTemplate={Boolean(draggingTemplate)}
                  creatingDate={creatingDate}
                  isEraserOn={isEraserOn}
                  isDayGoalPending={isPendingDayGoal}
                  selectedDayKey={dailyDateKey}
                  weekPreviewStartKey={weekPreviewStartKey}
                  onHoverDate={() => {}}
                  onConfirmDayGoal={(dayGoalId, dateKey) => {
                    void handleConfirmDayGoal(dayGoalId, dateKey);
                  }}
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
                  todayKey={todayKey}
                  previewDateKeys={previewDateKeys}
                  draggingTemplate={Boolean(draggingTemplate)}
                  creatingDate={creatingDate}
                  isEraserOn={isEraserOn}
                  isDayGoalPending={isPendingDayGoal}
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
              <div className={cn(isFixedDesktopWorkspace && "xl:min-h-0 xl:flex-1 xl:overflow-hidden")}>
                <DailyViewCard
                  className={cn(isFixedDesktopWorkspace && "xl:max-h-full")}
                  dailyDateLabel={dailyDateLabel}
                  dailyDateKey={dailyDateKey}
                  isToday={dailyDateKey === todayKey}
                  currentDayGoalId={dayGoalIdsByDate[dailyDateKey] ?? null}
                  isCurrentDayConfirmed={dayGoalConfirmedByDate[dailyDateKey] ?? false}
                  isCurrentDayGoalPending={isPendingDayGoal(
                    dayGoalIdsByDate[dailyDateKey] ?? null
                  )}
                  dailyEntries={dailyEntries}
                  isLoadingDailyEntries={isLoadingDailyEntries}
                  isDailyPreviewTarget={isDailyPreviewTarget}
                  canDropOnDailyDate={canDropOnDailyDate}
                  draggingTemplate={Boolean(draggingTemplate)}
                  creatingDate={creatingDate}
                  isEraserOn={isEraserOn}
                  shouldIgnorePostDropInteraction={shouldIgnorePostDropInteraction}
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
              </div>
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
