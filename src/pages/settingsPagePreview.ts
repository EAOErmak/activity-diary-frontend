import type { UserDto } from "@/shared/types/user";

export type SettingsPageLocale = "en" | "ru";

export type SettingsSectionId =
  | "experience"
  | "diary"
  | "planning"
  | "insights"
  | "privacy";

export type SettingsPreviewState = {
  displayName: string;
  homeView: "diary" | "goals" | "dashboard" | "calendar";
  compactCards: boolean;
  streakHighlights: boolean;
  appLanguage: "follow-app" | "en" | "ru";
  timeZone: "auto" | "utc-plus-3" | "utc-plus-5" | "utc";
  weekStartsOn: "monday" | "sunday";
  dateFormat: "dmy" | "ymd" | "long";
  dayBoundary: string;
  defaultEntryStatus: "planned" | "active" | "finished";
  reflectionTemplate: "guided" | "minimal" | "weekly";
  carryTags: boolean;
  promptIncomplete: boolean;
  moodPrompt: boolean;
  durationUnit: "minutes" | "hours";
  distanceUnit: "km" | "mi";
  bodyMetrics: "metric" | "imperial";
  nutritionUnit: "kcal" | "kj";
  goalResetDay: "monday" | "sunday";
  lowNoiseMode: boolean;
  morningReminder: string;
  middayReminder: string;
  eveningReminder: string;
  weeklyDigest: boolean;
  gentleMisses: boolean;
  carryOverGoals: boolean;
  defaultRange: "7d" | "14d" | "30d";
  comparisonBaseline: "previous-week" | "rolling-average" | "same-week-last-month";
  recoverySignals: boolean;
  blendGoals: boolean;
  chartDensity: "compact" | "comfortable" | "detailed";
  smartPrompts: boolean;
  routineDrift: boolean;
  anomalyHints: boolean;
  insightTone: "gentle" | "coach" | "analytical";
  privateByDefault: boolean;
  hideTotals: boolean;
  shareSnapshots: boolean;
  exportScope: "summary" | "detailed" | "archive";
  autoLock: "15m" | "30m" | "1h";
  deviceAlerts: boolean;
  maskMetrics: boolean;
};

export type SettingsOption = {
  value: string;
  label: string;
};

type SettingsRowBase<TKind extends "switch" | "select" | "input"> = {
  id: keyof SettingsPreviewState;
  label: string;
  description: string;
  kind: TKind;
  badge?: string;
};

export type SettingsRow =
  | SettingsRowBase<"switch">
  | (SettingsRowBase<"select"> & {
      options: SettingsOption[];
    })
  | (SettingsRowBase<"input"> & {
      placeholder: string;
      inputType?: "text" | "time";
    });

export type SettingsPanel = {
  title: string;
  description: string;
  badge: string;
  rows: SettingsRow[];
};

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
  noteTitle: string;
  note: string;
  panels: SettingsPanel[];
};

export type SettingsSummaryCardMeta = {
  id: "reflection" | "tracking" | "analytics" | "privacy";
  label: string;
  detail: string;
};

export type SettingsReminderMoment = {
  label: string;
  phase: string;
  detail: string;
};

export type SettingsDigestModule = {
  label: string;
  badge: string;
  detail: string;
};

export type SettingsAccountFact = {
  label: string;
  value: string;
  detail: string;
};

export type SettingsIntegration = {
  label: string;
  detail: string;
  status: string;
  tone: "ready" | "queued" | "planned";
  actionLabel: string;
};

export type SettingsRoadmapItem = {
  label: string;
  detail: string;
  status: string;
  tone: "ready" | "next" | "later";
};

export type SettingsPagePreview = {
  header: {
    badge: string;
    title: string;
    description: string;
    previewTitle: string;
    previewText: string;
    tags: string[];
    resetLabel: string;
    saveLabel: string;
    saveHint: string;
  };
  identity: {
    name: string;
    handle: string;
    role: string;
    status: string;
    trackingSince: string;
  };
  summaryCards: SettingsSummaryCardMeta[];
  sections: SettingsSection[];
  templates: {
    title: string;
    description: string;
    items: string[];
  };
  reminderMoments: {
    title: string;
    description: string;
    digestOffValue: string;
    items: SettingsReminderMoment[];
  };
  digest: {
    title: string;
    description: string;
    items: SettingsDigestModule[];
  };
  privacy: {
    integrationsTitle: string;
    integrationsDescription: string;
    integrations: SettingsIntegration[];
    accountTitle: string;
    accountDescription: string;
    accountFacts: SettingsAccountFact[];
  };
  sidebar: {
    blendTitle: string;
    blendDescription: string;
    lowNoiseLabel: string;
    balancedLabel: string;
    principlesTitle: string;
    principles: string[];
    roadmapTitle: string;
    roadmapItems: SettingsRoadmapItem[];
  };
  summaryValues: {
    privateDefault: string;
    shareReady: string;
  };
};

type LocalizedSettingsDefinition = Omit<SettingsPagePreview, "identity" | "privacy"> & {
  identityFallback: SettingsPagePreview["identity"];
  privacy: Omit<SettingsPagePreview["privacy"], "accountFacts"> & {
    accountFactTemplates: {
      accessLevel: Omit<SettingsAccountFact, "value">;
      accountState: Omit<SettingsAccountFact, "value">;
      exportReadiness: Omit<SettingsAccountFact, "value">;
      trustModel: Omit<SettingsAccountFact, "value">;
    };
  };
};

const previewDefinition: Record<SettingsPageLocale, LocalizedSettingsDefinition> = {
  en: {
    header: {
      badge: "Settings Workspace",
      title: "Shape how Activity Diary tracks, reflects, reminds, and protects your space.",
      description:
        "This screen is designed as a future product control surface: diary defaults, weekly rhythm, analytics lens, and privacy posture are already grouped into believable settings layers.",
      previewTitle: "Local preview only",
      previewText:
        "Controls below update local UI state so the page already feels real, but nothing is sent to the backend yet.",
      tags: [
        "Personalization",
        "Diary defaults",
        "Goals and reminders",
        "Insights",
        "Privacy",
      ],
      resetLabel: "Reset preview",
      saveLabel: "Save when live",
      saveHint: "Saving stays disabled until the backend settings contract is ready.",
    },
    identityFallback: {
      name: "Reflective user",
      handle: "@activity_diary",
      role: "Personal workspace",
      status: "Preview mode",
      trackingSince: "Tracking since February 2026",
    },
    summaryCards: [
      {
        id: "reflection",
        label: "Reflection rhythm",
        detail: "How the product closes the day and prepares the next review loop.",
      },
      {
        id: "tracking",
        label: "Tracking baseline",
        detail: "Grouping rules that affect diary entries, goals, and weekly surfaces.",
      },
      {
        id: "analytics",
        label: "Analytics lens",
        detail: "Which range and comparison style should feel normal by default.",
      },
      {
        id: "privacy",
        label: "Privacy mode",
        detail: "The tone of trust before exports, sharing, and smart summaries arrive.",
      },
    ],
    sections: [
      {
        id: "experience",
        label: "Experience",
        description: "Profile tone, entry point, language, and time grouping.",
        noteTitle: "Make the product feel like your workspace",
        note:
          "Experience settings belong here because this app is not only a tracker. It is a personal operating layer for routines, reflection, and steady review.",
        panels: [
          {
            title: "Profile and workspace",
            description:
              "These preferences shape the first impression and decide how personal the product already feels.",
            badge: "Foundation",
            rows: [
              {
                id: "displayName",
                label: "Display name in reflective surfaces",
                description:
                  "Used later in profile cards, weekly digests, and calmer reminder copy.",
                kind: "input",
                placeholder: "Reflective user",
                inputType: "text",
              },
              {
                id: "homeView",
                label: "Start page",
                description: "Choose the screen that should anchor your return flow.",
                kind: "select",
                options: [
                  { value: "diary", label: "Diary" },
                  { value: "goals", label: "Goals" },
                  { value: "dashboard", label: "Analytics" },
                  { value: "calendar", label: "Calendar" },
                ],
              },
              {
                id: "compactCards",
                label: "Compact cards and denser summaries",
                description:
                  "Useful if you prefer scanning more signals without turning pages into dashboards.",
                kind: "switch",
              },
              {
                id: "streakHighlights",
                label: "Highlight current streaks in key headers",
                description: "Keeps momentum visible without making every screen feel noisy.",
                kind: "switch",
              },
            ],
          },
          {
            title: "Language, calendar, and time",
            description:
              "Time grouping influences diary rollovers, weekly planning, and chart readability.",
            badge: "Rhythm",
            rows: [
              {
                id: "appLanguage",
                label: "Settings language mode",
                description: "Can follow the global app switch or stay pinned for the settings area.",
                kind: "select",
                options: [
                  { value: "follow-app", label: "Follow app language" },
                  { value: "en", label: "English" },
                  { value: "ru", label: "Russian" },
                ],
              },
              {
                id: "timeZone",
                label: "Timezone handling",
                description:
                  "Future reminders and day summaries should respect where the day actually happens.",
                kind: "select",
                options: [
                  { value: "auto", label: "Auto-detect current timezone" },
                  { value: "utc-plus-3", label: "UTC+3" },
                  { value: "utc-plus-5", label: "UTC+5" },
                  { value: "utc", label: "UTC" },
                ],
              },
              {
                id: "weekStartsOn",
                label: "Week starts on",
                description: "Shared by goals, calendar summaries, and weekly reviews.",
                kind: "select",
                options: [
                  { value: "monday", label: "Monday" },
                  { value: "sunday", label: "Sunday" },
                ],
              },
              {
                id: "dateFormat",
                label: "Date format",
                description: "Keeps diary tables and future exports readable.",
                kind: "select",
                options: [
                  { value: "dmy", label: "DD.MM.YYYY" },
                  { value: "ymd", label: "YYYY-MM-DD" },
                  { value: "long", label: "Long human-readable" },
                ],
              },
              {
                id: "dayBoundary",
                label: "Day boundary",
                description:
                  "Late-night entries after this time can roll into the next day instead of breaking the story.",
                kind: "input",
                placeholder: "04:00",
                inputType: "time",
              },
            ],
          },
        ],
      },
      {
        id: "diary",
        label: "Diary",
        description: "Entry defaults, units, and low-friction capture behavior.",
        noteTitle: "Keep logging low-friction and consistent",
        note:
          "Diary settings matter because the core product behavior is repeated capture. Fast defaults reduce friction on ordinary days, not only ideal ones.",
        panels: [
          {
            title: "Entry defaults",
            description:
              "These controls define how much structure the diary suggests before the user writes anything.",
            badge: "Capture",
            rows: [
              {
                id: "defaultEntryStatus",
                label: "Default entry status",
                description: "Useful for quick capture before the final state is clear.",
                kind: "select",
                options: [
                  { value: "planned", label: "Planned" },
                  { value: "active", label: "In progress" },
                  { value: "finished", label: "Completed" },
                ],
              },
              {
                id: "reflectionTemplate",
                label: "Reflection prompt style",
                description: "Controls how much structure appears when the day closes.",
                kind: "select",
                options: [
                  { value: "guided", label: "Guided review" },
                  { value: "minimal", label: "Minimal nudge" },
                  { value: "weekly", label: "Weekly review lens" },
                ],
              },
              {
                id: "promptIncomplete",
                label: "Warn before closing unfinished entries",
                description: "Helps preserve intent when the day is still in motion.",
                kind: "switch",
              },
              {
                id: "carryTags",
                label: "Carry recent tags into the next entry",
                description: "Useful for repeated routines like sleep, focus blocks, or training.",
                kind: "switch",
              },
              {
                id: "moodPrompt",
                label: "Suggest a quick mood check-in",
                description: "Adds one lightweight subjective signal without forcing long notes.",
                kind: "switch",
              },
            ],
          },
          {
            title: "Tracking units",
            description:
              "Self-tracking stays credible when units and formats remain stable across screens.",
            badge: "Precision",
            rows: [
              {
                id: "durationUnit",
                label: "Duration tracking",
                description: "Choose how time-based signals should usually read.",
                kind: "select",
                options: [
                  { value: "minutes", label: "Minutes" },
                  { value: "hours", label: "Hours + minutes" },
                ],
              },
              {
                id: "distanceUnit",
                label: "Distance and movement",
                description: "Used later in activity, recovery, and outdoor tracking blocks.",
                kind: "select",
                options: [
                  { value: "km", label: "Kilometers" },
                  { value: "mi", label: "Miles" },
                ],
              },
              {
                id: "bodyMetrics",
                label: "Body metrics",
                description: "Keeps body and health-related measurements internally consistent.",
                kind: "select",
                options: [
                  { value: "metric", label: "Metric (kg / cm)" },
                  { value: "imperial", label: "Imperial (lb / in)" },
                ],
              },
              {
                id: "nutritionUnit",
                label: "Nutrition energy",
                description: "Applies to food tracking and summary cards.",
                kind: "select",
                options: [
                  { value: "kcal", label: "kcal" },
                  { value: "kj", label: "kJ" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "planning",
        label: "Planning",
        description: "Goal cadence, nudges, and reminder windows.",
        noteTitle: "Support follow-through without turning into noise",
        note:
          "Planning settings should preserve consistency and trust. In this product, reminders exist to reinforce routines, not to punish imperfect weeks.",
        panels: [
          {
            title: "Goals cadence",
            description:
              "These settings frame how the product treats missed commitments, weekly resets, and carry-over.",
            badge: "Consistency",
            rows: [
              {
                id: "goalResetDay",
                label: "Weekly reset anchor",
                description: "Defines when weekly goals feel renewed and mentally clean.",
                kind: "select",
                options: [
                  { value: "monday", label: "Monday" },
                  { value: "sunday", label: "Sunday" },
                ],
              },
              {
                id: "weeklyDigest",
                label: "Weekly digest and closeout prompt",
                description: "Turns raw logs into one calmer weekly summary surface.",
                kind: "switch",
              },
              {
                id: "gentleMisses",
                label: "Use gentle language for missed commitments",
                description: "The product should nudge without sounding punitive.",
                kind: "switch",
              },
              {
                id: "carryOverGoals",
                label: "Keep unfinished goals visible next week",
                description: "Useful when routines matter more than strict weekly closure.",
                kind: "switch",
              },
            ],
          },
          {
            title: "Reminder windows",
            description:
              "Reminder timing works best when it follows real energy shifts instead of arbitrary notification spam.",
            badge: "Nudges",
            rows: [
              {
                id: "lowNoiseMode",
                label: "Low-noise reminder mode",
                description: "Fewer prompts, limited to anchor moments that feel intentional.",
                kind: "switch",
              },
              {
                id: "morningReminder",
                label: "Morning plan window",
                description: "A cue to set intent before the day fragments.",
                kind: "input",
                placeholder: "07:30",
                inputType: "time",
              },
              {
                id: "middayReminder",
                label: "Midday reset window",
                description: "A short checkpoint for goals, food, or energy.",
                kind: "input",
                placeholder: "13:00",
                inputType: "time",
              },
              {
                id: "eveningReminder",
                label: "Evening reflection window",
                description: "The moment when streaks and notes usually feel easiest to close.",
                kind: "input",
                placeholder: "21:00",
                inputType: "time",
              },
            ],
          },
        ],
      },
      {
        id: "insights",
        label: "Insights",
        description: "Analytics defaults, digest logic, and future smart layers.",
        noteTitle: "Decide which signals deserve attention",
        note:
          "Insight settings make sense in Activity Diary because the product is not only about storing events. It is about choosing the lenses that make patterns useful and humane.",
        panels: [
          {
            title: "Analytics defaults",
            description:
              "These values define what the analytics area should emphasize before charts become dense.",
            badge: "Lens",
            rows: [
              {
                id: "defaultRange",
                label: "Default analysis range",
                description: "Sets the normal time horizon for charts and summaries.",
                kind: "select",
                options: [
                  { value: "7d", label: "Last 7 days" },
                  { value: "14d", label: "Last 14 days" },
                  { value: "30d", label: "Last 30 days" },
                ],
              },
              {
                id: "comparisonBaseline",
                label: "Comparison baseline",
                description: "Useful for trend views that should feel personal, not abstract.",
                kind: "select",
                options: [
                  { value: "previous-week", label: "Previous week" },
                  { value: "rolling-average", label: "Rolling average" },
                  { value: "same-week-last-month", label: "Same weekday last month" },
                ],
              },
              {
                id: "recoverySignals",
                label: "Surface recovery and energy signals",
                description: "Balances productivity metrics with restoration cues.",
                kind: "switch",
              },
              {
                id: "blendGoals",
                label: "Mix goal completion into insight cards",
                description: "Shows whether intent and execution are aligned.",
                kind: "switch",
              },
              {
                id: "chartDensity",
                label: "Chart density",
                description: "Choose whether charts should feel compact, calm, or detailed.",
                kind: "select",
                options: [
                  { value: "compact", label: "Compact" },
                  { value: "comfortable", label: "Comfortable" },
                  { value: "detailed", label: "Detailed" },
                ],
              },
            ],
          },
          {
            title: "Smart features",
            description:
              "Future smart layers should feel assistive and reflective, not intrusive or overconfident.",
            badge: "Future",
            rows: [
              {
                id: "smartPrompts",
                label: "Generate weekly reflection prompts",
                description: "Turns routine patterns into better review questions.",
                kind: "switch",
              },
              {
                id: "routineDrift",
                label: "Detect drifting routines",
                description: "Flags when anchor habits start slipping quietly.",
                kind: "switch",
              },
              {
                id: "anomalyHints",
                label: "Highlight unusual days carefully",
                description: "Surfaces outliers without treating them as failures.",
                kind: "switch",
              },
              {
                id: "insightTone",
                label: "Insight tone",
                description: "Controls how future summaries should sound.",
                kind: "select",
                options: [
                  { value: "gentle", label: "Gentle" },
                  { value: "coach", label: "Coach-like" },
                  { value: "analytical", label: "Analytical" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "privacy",
        label: "Privacy",
        description: "Sharing posture, export scope, and access trust.",
        noteTitle: "Protect trust before adding more automation",
        note:
          "Privacy settings are essential in a self-tracking product. Users need to feel that reflection, goals, and metrics remain under personal control before any smart layer expands.",
        panels: [
          {
            title: "Privacy posture",
            description:
              "These controls define the default visibility of diary data, summaries, and future exports.",
            badge: "Trust",
            rows: [
              {
                id: "privateByDefault",
                label: "Keep diary data private by default",
                description: "The safest starting point for reflection-heavy logging.",
                kind: "switch",
              },
              {
                id: "hideTotals",
                label: "Hide diary totals on profile-style surfaces",
                description: "Useful if progress summaries should stay more private than goals.",
                kind: "switch",
              },
              {
                id: "shareSnapshots",
                label: "Allow future shareable insight cards",
                description: "Reserved for curated summaries, not raw diary exposure.",
                kind: "switch",
              },
              {
                id: "exportScope",
                label: "Export scope",
                description: "Decides how much data should leave the product by default.",
                kind: "select",
                options: [
                  { value: "summary", label: "Summary only" },
                  { value: "detailed", label: "Detailed export" },
                  { value: "archive", label: "Personal archive JSON" },
                ],
              },
            ],
          },
          {
            title: "Session and access",
            description:
              "Lightweight security controls should be visible enough to inspire trust without dominating the page.",
            badge: "Access",
            rows: [
              {
                id: "autoLock",
                label: "Auto-lock after inactivity",
                description: "A simple future protection for reflective or sensitive sessions.",
                kind: "select",
                options: [
                  { value: "15m", label: "15 minutes" },
                  { value: "30m", label: "30 minutes" },
                  { value: "1h", label: "1 hour" },
                ],
              },
              {
                id: "deviceAlerts",
                label: "Show new-device sign-in alerts",
                description: "Makes account changes visible without cluttering everyday tracking.",
                kind: "switch",
              },
              {
                id: "maskMetrics",
                label: "Mask personal metrics in shared surfaces",
                description: "Useful later if shareable insight cards become available.",
                kind: "switch",
              },
            ],
          },
        ],
      },
    ],
    templates: {
      title: "Template-ready diary blocks",
      description:
        "Believable presets that later could connect diary settings with entry and day templates.",
      items: ["Morning reset", "Deep work block", "Workout check-in", "Evening review"],
    },
    reminderMoments: {
      title: "Nudge preview",
      description:
        "A future schedule should feel like a calm rhythm layer, not a notification storm.",
      digestOffValue: "Digest off",
      items: [
        {
          label: "Morning focus prompt",
          phase: "Morning anchor",
          detail: "Used to set intent before messages and reactive tasks take over.",
        },
        {
          label: "Midday reset",
          phase: "Midday check",
          detail: "A small pause to re-prioritize goals, food, or energy.",
        },
        {
          label: "Evening reflection",
          phase: "Closeout",
          detail: "The lightest place to protect streaks, notes, and continuity.",
        },
        {
          label: "Weekly digest",
          phase: "Weekly review",
          detail: "One calmer summary that turns repeated logs into perspective.",
        },
      ],
    },
    digest: {
      title: "Digest composition",
      description:
        "These modules make the insights area feel grounded in self-management, not abstract analytics.",
      items: [
        {
          label: "Consistency pulse",
          badge: "Core",
          detail: "Shows how reliably the week held together across diary actions and routines.",
        },
        {
          label: "Goal drift",
          badge: "Planning",
          detail: "Highlights when intent stays high but visible follow-through softens.",
        },
        {
          label: "Recovery cue",
          badge: "Balance",
          detail: "Keeps rest and energy visible next to output-heavy signals.",
        },
        {
          label: "Reflection prompt",
          badge: "AI layer",
          detail: "Turns patterns into one useful question instead of a noisy summary wall.",
        },
      ],
    },
    privacy: {
      integrationsTitle: "Connected features",
      integrationsDescription:
        "A believable place for future integrations without forcing them into the core experience today.",
      integrations: [
        {
          label: "Calendar bridge",
          detail: "Useful later for comparing planned days with lived days.",
          status: "Ready for layout",
          tone: "ready",
          actionLabel: "Preview bridge",
        },
        {
          label: "Health import",
          detail: "A natural source for recovery, sleep, and movement signals.",
          status: "Queued",
          tone: "queued",
          actionLabel: "Queued",
        },
        {
          label: "Automation hooks",
          detail: "Reserved for exports, coaches, or personal workflow automation.",
          status: "Planned",
          tone: "planned",
          actionLabel: "Planned",
        },
      ],
      accountTitle: "Account and trust facts",
      accountDescription:
        "These facts keep identity, access, and data posture visible without turning the page into a security dashboard.",
      accountFactTemplates: {
        accessLevel: {
          label: "Access level",
          detail: "Role or plan still matters because it shapes future capabilities.",
        },
        accountState: {
          label: "Account state",
          detail: "Users need quick reassurance that the workspace is active and stable.",
        },
        exportReadiness: {
          label: "Export readiness",
          detail: "The product should eventually know how cleanly summaries can leave the app.",
        },
        trustModel: {
          label: "Trust model",
          detail: "A simple explanation of how privacy and session safety currently behave.",
        },
      },
    },
    sidebar: {
      blendTitle: "Current preview blend",
      blendDescription:
        "A compact readout of the choices currently shaping the placeholder experience.",
      lowNoiseLabel: "Low-noise reminders",
      balancedLabel: "Full reminder cadence",
      principlesTitle: "What this page is for",
      principles: [
        "Personalization should reinforce routine, not just decorate the interface.",
        "Diary defaults matter because fast capture is the product's repeated behavior.",
        "Planning cues should feel calm enough to preserve trust and consistency.",
        "Privacy and insight controls should exist before the smart layer expands.",
      ],
      roadmapTitle: "Wiring roadmap",
      roadmapItems: [
        {
          label: "Profile-linked preferences",
          detail: "The current layout is already ready to receive real account-backed values.",
          status: "Ready",
          tone: "ready",
        },
        {
          label: "Reminder delivery rules",
          detail: "Notification windows and digest scheduling can be connected next without redesigning the page.",
          status: "Next",
          tone: "next",
        },
        {
          label: "Export presets and retention",
          detail: "Privacy cards already leave space for real data portability rules later.",
          status: "Later",
          tone: "later",
        },
        {
          label: "AI reflection assistant",
          detail: "Smart summaries and prompt tone are isolated so the feature can arrive gradually.",
          status: "Later",
          tone: "later",
        },
      ],
    },
    summaryValues: {
      privateDefault: "Private by default",
      shareReady: "Sharing is allowed",
    },
  },
  ru: {
    header: {
      badge: "Пространство настроек",
      title: "Настройте, как Activity Diary отслеживает, отражает, напоминает и защищает ваш личный ритм.",
      description:
        "Этот экран спроектирован как будущая продуктовая control surface: здесь уже есть логика для дневника, недельного ритма, аналитики и приватности.",
      previewTitle: "Локальный preview",
      previewText:
        "Элементы ниже меняют только локальное состояние интерфейса. Backend-сохранения пока нет, но структура уже готова к поэтапному подключению.",
      tags: ["Персонализация", "Дневник", "Цели и напоминания", "Инсайты", "Приватность"],
      resetLabel: "Сбросить preview",
      saveLabel: "Сохранить позже",
      saveHint: "Сохранение останется выключенным, пока не появится финальный backend-контракт.",
    },
    identityFallback: {
      name: "Осмысленный пользователь",
      handle: "@activity_diary",
      role: "Личное пространство",
      status: "Preview-режим",
      trackingSince: "Трекинг с февраля 2026",
    },
    summaryCards: [
      {
        id: "reflection",
        label: "Ритм рефлексии",
        detail: "Как продукт завершает день и подготавливает следующий цикл обзора.",
      },
      {
        id: "tracking",
        label: "База трекинга",
        detail: "Правила группировки, которые влияют на дневник, цели и недельные поверхности.",
      },
      {
        id: "analytics",
        label: "Оптика аналитики",
        detail: "Какой диапазон и тип сравнения должны ощущаться нормой по умолчанию.",
      },
      {
        id: "privacy",
        label: "Режим приватности",
        detail: "Тон доверия до появления экспорта, шаринга и smart-сводок.",
      },
    ],
    sections: [
      {
        id: "experience",
        label: "Опыт",
        description: "Тон профиля, стартовый экран, язык и логика времени.",
        noteTitle: "Сделайте продукт своим рабочим пространством",
        note:
          "Здесь находятся настройки базового опыта, потому что приложение работает не только как трекер. Это личный слой управления рутиной, рефлексией и обзором недели.",
        panels: [
          {
            title: "Профиль и рабочее пространство",
            description:
              "Эти параметры формируют первое впечатление и делают продукт более личным еще до подключения реальных данных.",
            badge: "Основа",
            rows: [
              {
                id: "displayName",
                label: "Отображаемое имя в reflective-поверхностях",
                description: "Позже пригодится для профиля, digest-карточек и мягких напоминаний.",
                kind: "input",
                placeholder: "Осмысленный пользователь",
                inputType: "text",
              },
              {
                id: "homeView",
                label: "Стартовый экран",
                description: "Выберите раздел, который должен быть вашим обычным входом обратно в продукт.",
                kind: "select",
                options: [
                  { value: "diary", label: "Дневник" },
                  { value: "goals", label: "Цели" },
                  { value: "dashboard", label: "Аналитика" },
                  { value: "calendar", label: "Календарь" },
                ],
              },
              {
                id: "compactCards",
                label: "Более плотные карточки и summary-блоки",
                description: "Полезно, если хочется видеть больше сигналов без перегруза.",
                kind: "switch",
              },
              {
                id: "streakHighlights",
                label: "Показывать текущие streaks в ключевых header-блоках",
                description: "Держит импульс на виду, но не превращает страницы в dashboard.",
                kind: "switch",
              },
            ],
          },
          {
            title: "Язык, календарь и время",
            description:
              "Группировка по времени влияет на rollover записей, недельное планирование и читаемость графиков.",
            badge: "Ритм",
            rows: [
              {
                id: "appLanguage",
                label: "Языковой режим настроек",
                description: "Может следовать за глобальным переключателем приложения или жить отдельно.",
                kind: "select",
                options: [
                  { value: "follow-app", label: "Следовать языку приложения" },
                  { value: "en", label: "English" },
                  { value: "ru", label: "Русский" },
                ],
              },
              {
                id: "timeZone",
                label: "Обработка часового пояса",
                description:
                  "Будущие напоминания и дневные summary должны уважать реальный контекст дня.",
                kind: "select",
                options: [
                  { value: "auto", label: "Автоопределение текущего пояса" },
                  { value: "utc-plus-3", label: "UTC+3" },
                  { value: "utc-plus-5", label: "UTC+5" },
                  { value: "utc", label: "UTC" },
                ],
              },
              {
                id: "weekStartsOn",
                label: "Начало недели",
                description: "Разделяется целями, календарем и недельными обзорами.",
                kind: "select",
                options: [
                  { value: "monday", label: "Понедельник" },
                  { value: "sunday", label: "Воскресенье" },
                ],
              },
              {
                id: "dateFormat",
                label: "Формат даты",
                description: "Нужен для читабельности таблиц дневника и будущего экспорта.",
                kind: "select",
                options: [
                  { value: "dmy", label: "ДД.ММ.ГГГГ" },
                  { value: "ymd", label: "ГГГГ-ММ-ДД" },
                  { value: "long", label: "Длинный человеческий формат" },
                ],
              },
              {
                id: "dayBoundary",
                label: "Граница дня",
                description:
                  "Поздние записи после этого времени можно относить к следующему дню, а не ломать контекст.",
                kind: "input",
                placeholder: "04:00",
                inputType: "time",
              },
            ],
          },
        ],
      },
      {
        id: "diary",
        label: "Дневник",
        description: "Entry defaults, единицы и low-friction capture.",
        noteTitle: "Сделайте логирование легким и повторяемым",
        note:
          "Настройки дневника важны потому, что основное действие в продукте — повторяющееся фиксирование. Хорошие defaults уменьшают трение в обычные дни, а не только в идеальные.",
        panels: [
          {
            title: "Поведение записей по умолчанию",
            description:
              "Эти параметры определяют, сколько структуры дневник предлагает еще до того, как пользователь что-то написал.",
            badge: "Захват",
            rows: [
              {
                id: "defaultEntryStatus",
                label: "Статус записи по умолчанию",
                description: "Полезно для быстрого capture, когда итоговый статус еще не ясен.",
                kind: "select",
                options: [
                  { value: "planned", label: "Запланировано" },
                  { value: "active", label: "В процессе" },
                  { value: "finished", label: "Завершено" },
                ],
              },
              {
                id: "reflectionTemplate",
                label: "Стиль prompt-а для рефлексии",
                description: "Управляет тем, сколько структуры появляется при закрытии дня.",
                kind: "select",
                options: [
                  { value: "guided", label: "Направляемый обзор" },
                  { value: "minimal", label: "Минимальный намек" },
                  { value: "weekly", label: "Недельная оптика" },
                ],
              },
              {
                id: "promptIncomplete",
                label: "Предупреждать перед закрытием незавершенных записей",
                description: "Помогает не терять исходный замысел, если день еще в движении.",
                kind: "switch",
              },
              {
                id: "carryTags",
                label: "Переносить недавние теги в следующую запись",
                description: "Удобно для повторяющихся рутин: сон, focus-блоки, тренировки.",
                kind: "switch",
              },
              {
                id: "moodPrompt",
                label: "Подсказывать быстрый чек-ин по настроению",
                description: "Добавляет легкий субъективный сигнал без длинной заметки.",
                kind: "switch",
              },
            ],
          },
          {
            title: "Единицы трекинга",
            description:
              "Self-tracking выглядит убедительнее, когда единицы и форматы стабильны на всех экранах.",
            badge: "Точность",
            rows: [
              {
                id: "durationUnit",
                label: "Отображение длительности",
                description: "Определяет, как обычно показываются time-based сигналы.",
                kind: "select",
                options: [
                  { value: "minutes", label: "Минуты" },
                  { value: "hours", label: "Часы + минуты" },
                ],
              },
              {
                id: "distanceUnit",
                label: "Дистанция и движение",
                description: "Понадобится позже для активности, восстановления и outdoor-трекинга.",
                kind: "select",
                options: [
                  { value: "km", label: "Километры" },
                  { value: "mi", label: "Мили" },
                ],
              },
              {
                id: "bodyMetrics",
                label: "Телесные метрики",
                description: "Держит health-сигналы согласованными между секциями.",
                kind: "select",
                options: [
                  { value: "metric", label: "Метрическая система (кг / см)" },
                  { value: "imperial", label: "Имперская система (lb / in)" },
                ],
              },
              {
                id: "nutritionUnit",
                label: "Энергия в питании",
                description: "Применяется к food-трекингу и summary-карточкам.",
                kind: "select",
                options: [
                  { value: "kcal", label: "ккал" },
                  { value: "kj", label: "кДж" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "planning",
        label: "Планирование",
        description: "Ритм целей, nudges и окна напоминаний.",
        noteTitle: "Поддерживайте follow-through без лишнего шума",
        note:
          "Настройки планирования должны усиливать стабильность и доверие. В этом продукте напоминания нужны не для давления, а для поддержки рутин и спокойного возврата в систему.",
        panels: [
          {
            title: "Ритм целей",
            description:
              "Эти настройки задают, как продукт относится к пропущенным обязательствам, недельному reset-у и переносу целей.",
            badge: "Стабильность",
            rows: [
              {
                id: "goalResetDay",
                label: "Якорь недельного reset-а",
                description: "Определяет, когда недельные цели ощущаются обновленными и чистыми.",
                kind: "select",
                options: [
                  { value: "monday", label: "Понедельник" },
                  { value: "sunday", label: "Воскресенье" },
                ],
              },
              {
                id: "weeklyDigest",
                label: "Weekly digest и closeout-prompt",
                description: "Превращает сырые логи в один более спокойный недельный обзор.",
                kind: "switch",
              },
              {
                id: "gentleMisses",
                label: "Мягкий язык для пропущенных commitments",
                description: "Продукт должен подталкивать, а не звучать как наказание.",
                kind: "switch",
              },
              {
                id: "carryOverGoals",
                label: "Показывать незавершенные цели на следующей неделе",
                description: "Полезно, когда ритм важнее строгого weekly closure.",
                kind: "switch",
              },
            ],
          },
          {
            title: "Окна напоминаний",
            description:
              "Время напоминаний работает лучше, когда следует за реальными энергетическими переходами, а не спамит уведомлениями.",
            badge: "Подсказки",
            rows: [
              {
                id: "lowNoiseMode",
                label: "Low-noise режим напоминаний",
                description: "Меньше prompts, только вокруг якорных моментов.",
                kind: "switch",
              },
              {
                id: "morningReminder",
                label: "Утреннее окно планирования",
                description: "Подсказка задать намерение до того, как день распадется на реактивные куски.",
                kind: "input",
                placeholder: "07:30",
                inputType: "time",
              },
              {
                id: "middayReminder",
                label: "Окно дневного reset-а",
                description: "Короткая точка сверки для целей, еды и энергии.",
                kind: "input",
                placeholder: "13:00",
                inputType: "time",
              },
              {
                id: "eveningReminder",
                label: "Окно вечерней рефлексии",
                description: "Момент, в котором проще всего закрыть streaks и заметки.",
                kind: "input",
                placeholder: "21:00",
                inputType: "time",
              },
            ],
          },
        ],
      },
      {
        id: "insights",
        label: "Инсайты",
        description: "Defaults аналитики, digest-логика и будущие smart-layer функции.",
        noteTitle: "Выберите, какие сигналы заслуживают внимания",
        note:
          "Настройки инсайтов уместны здесь, потому что Activity Diary нужен не только для хранения событий. Продукт должен помогать выбирать полезные линзы, через которые patterns становятся осмысленными.",
        panels: [
          {
            title: "Параметры аналитики по умолчанию",
            description:
              "Эти значения определяют, что analytics-слой должен подчеркивать еще до появления сложных графиков.",
            badge: "Линза",
            rows: [
              {
                id: "defaultRange",
                label: "Диапазон анализа по умолчанию",
                description: "Задает обычный горизонт для графиков и summary.",
                kind: "select",
                options: [
                  { value: "7d", label: "Последние 7 дней" },
                  { value: "14d", label: "Последние 14 дней" },
                  { value: "30d", label: "Последние 30 дней" },
                ],
              },
              {
                id: "comparisonBaseline",
                label: "Базовая точка сравнения",
                description: "Нужна для трендов, которые должны ощущаться личными, а не абстрактными.",
                kind: "select",
                options: [
                  { value: "previous-week", label: "Предыдущая неделя" },
                  { value: "rolling-average", label: "Скользящее среднее" },
                  { value: "same-week-last-month", label: "Тот же день недели месяц назад" },
                ],
              },
              {
                id: "recoverySignals",
                label: "Показывать сигналы восстановления и энергии",
                description: "Балансирует productivity-метрики с cues на восстановление.",
                kind: "switch",
              },
              {
                id: "blendGoals",
                label: "Смешивать выполнение целей в insight-карточках",
                description: "Показывает, насколько намерение совпадает с исполнением.",
                kind: "switch",
              },
              {
                id: "chartDensity",
                label: "Плотность графиков",
                description: "Определяет, насколько графики будут компактными, спокойными или детализированными.",
                kind: "select",
                options: [
                  { value: "compact", label: "Компактная" },
                  { value: "comfortable", label: "Спокойная" },
                  { value: "detailed", label: "Детальная" },
                ],
              },
            ],
          },
          {
            title: "Smart-функции",
            description:
              "Будущие умные слои должны ощущаться как поддержка и reflection, а не как навязчивый надзор.",
            badge: "Будущее",
            rows: [
              {
                id: "smartPrompts",
                label: "Генерировать weekly reflection prompts",
                description: "Превращает repeat-паттерны в более точные вопросы для обзора.",
                kind: "switch",
              },
              {
                id: "routineDrift",
                label: "Отслеживать drifting routines",
                description: "Замечает, когда якорные привычки начинают тихо распадаться.",
                kind: "switch",
              },
              {
                id: "anomalyHints",
                label: "Осторожно подсвечивать необычные дни",
                description: "Показывает аномалии, но не трактует их как провал.",
                kind: "switch",
              },
              {
                id: "insightTone",
                label: "Тон инсайтов",
                description: "Управляет тем, как будут звучать будущие summary-блоки.",
                kind: "select",
                options: [
                  { value: "gentle", label: "Мягкий" },
                  { value: "coach", label: "Как у спокойного коуча" },
                  { value: "analytical", label: "Аналитичный" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "privacy",
        label: "Приватность",
        description: "Поза шаринга, scope экспорта и доверие к доступу.",
        noteTitle: "Защитите доверие до расширения automation-слоя",
        note:
          "Настройки приватности критичны для self-tracking продукта. Пользователь должен чувствовать, что рефлексия, цели и метрики остаются под личным контролем до появления любых smart-надстроек.",
        panels: [
          {
            title: "Поза приватности",
            description:
              "Эти элементы задают стандартную видимость данных дневника, summary-блоков и будущего экспорта.",
            badge: "Доверие",
            rows: [
              {
                id: "privateByDefault",
                label: "Держать данные дневника приватными по умолчанию",
                description: "Самая безопасная стартовая точка для reflective-логирования.",
                kind: "switch",
              },
              {
                id: "hideTotals",
                label: "Скрывать totals дневника на profile-подобных поверхностях",
                description: "Полезно, если прогресс должен быть приватнее, чем сами цели.",
                kind: "switch",
              },
              {
                id: "shareSnapshots",
                label: "Разрешить будущие shareable insight-cards",
                description: "Резерв для curated summary, а не для сырого шаринга дневника.",
                kind: "switch",
              },
              {
                id: "exportScope",
                label: "Объем экспорта",
                description: "Определяет, сколько данных по умолчанию может покинуть продукт.",
                kind: "select",
                options: [
                  { value: "summary", label: "Только summary" },
                  { value: "detailed", label: "Детальный экспорт" },
                  { value: "archive", label: "Личный архив JSON" },
                ],
              },
            ],
          },
          {
            title: "Сессия и доступ",
            description:
              "Легкие security-контроли должны быть достаточно заметны, чтобы давать доверие, но не захватывать страницу.",
            badge: "Доступ",
            rows: [
              {
                id: "autoLock",
                label: "Автоблокировка при неактивности",
                description: "Простая будущая защита для чувствительных или reflective-сессий.",
                kind: "select",
                options: [
                  { value: "15m", label: "15 минут" },
                  { value: "30m", label: "30 минут" },
                  { value: "1h", label: "1 час" },
                ],
              },
              {
                id: "deviceAlerts",
                label: "Показывать alerts о входе с нового устройства",
                description: "Делает изменения аккаунта видимыми без лишней тревожности.",
                kind: "switch",
              },
              {
                id: "maskMetrics",
                label: "Маскировать личные метрики в shared-поверхностях",
                description: "Полезно, если позже появятся shareable-карточки.",
                kind: "switch",
              },
            ],
          },
        ],
      },
    ],
    templates: {
      title: "Template-ready блоки дневника",
      description:
        "Правдоподобные пресеты, которые позже можно будет связать с entry- и day-template слоями.",
      items: ["Утренний reset", "Deep work блок", "Workout check-in", "Вечерний обзор"],
    },
    reminderMoments: {
      title: "Preview подсказок",
      description:
        "Будущий график подсказок должен ощущаться как спокойный ритм, а не как notification-шторм.",
      digestOffValue: "Digest выключен",
      items: [
        {
          label: "Утренний focus-prompt",
          phase: "Утренний якорь",
          detail: "Помогает задать намерение до появления реактивного потока задач.",
        },
        {
          label: "Дневной reset",
          phase: "Середина дня",
          detail: "Небольшая пауза для сверки целей, еды или энергии.",
        },
        {
          label: "Вечерняя рефлексия",
          phase: "Закрытие дня",
          detail: "Самое легкое место, чтобы сохранить streaks, заметки и continuity.",
        },
        {
          label: "Weekly digest",
          phase: "Недельный обзор",
          detail: "Одна более спокойная сводка, превращающая повторяющиеся логи в перспективу.",
        },
      ],
    },
    digest: {
      title: "Состав digest-а",
      description:
        "Эти модули делают insights-слой частью self-management продукта, а не набором абстрактной аналитики.",
      items: [
        {
          label: "Пульс стабильности",
          badge: "Core",
          detail: "Показывает, насколько надежно неделя удержалась за счет дневника и рутин.",
        },
        {
          label: "Drift целей",
          badge: "Planning",
          detail: "Подсвечивает моменты, где намерение остается высоким, а follow-through проседает.",
        },
        {
          label: "Сигнал восстановления",
          badge: "Balance",
          detail: "Держит отдых и энергию рядом с output-heavy сигналами.",
        },
        {
          label: "Prompt для рефлексии",
          badge: "AI layer",
          detail: "Превращает patterns в один полезный вопрос вместо шумной стены summary.",
        },
      ],
    },
    privacy: {
      integrationsTitle: "Подключаемые возможности",
      integrationsDescription:
        "Естественное место для будущих интеграций без давления на core-опыт уже сейчас.",
      integrations: [
        {
          label: "Calendar bridge",
          detail: "Позже поможет сравнивать запланированные дни с реально прожитыми.",
          status: "Готово для layout",
          tone: "ready",
          actionLabel: "Показать mock",
        },
        {
          label: "Health import",
          detail: "Естественный источник сигналов сна, восстановления и движения.",
          status: "В очереди",
          tone: "queued",
          actionLabel: "В очереди",
        },
        {
          label: "Automation hooks",
          detail: "Резерв под экспорт, коучинг или личные workflow-автоматизации.",
          status: "Запланировано",
          tone: "planned",
          actionLabel: "Запланировано",
        },
      ],
      accountTitle: "Факты об аккаунте и доверии",
      accountDescription:
        "Эти блоки держат на виду identity, доступ и data posture, но не превращают страницу в security dashboard.",
      accountFactTemplates: {
        accessLevel: {
          label: "Уровень доступа",
          detail: "Роль или план все еще важны, потому что влияют на будущие возможности.",
        },
        accountState: {
          label: "Состояние аккаунта",
          detail: "Пользователю нужна быстрая уверенность, что пространство активно и стабильно.",
        },
        exportReadiness: {
          label: "Готовность к экспорту",
          detail: "Продукт позже должен понимать, насколько чисто summary может выйти наружу.",
        },
        trustModel: {
          label: "Модель доверия",
          detail: "Короткое объяснение того, как сейчас устроены приватность и безопасность сессии.",
        },
      },
    },
    sidebar: {
      blendTitle: "Текущий blend preview-а",
      blendDescription:
        "Компактный срез тех решений, которые прямо сейчас формируют placeholder-опыт.",
      lowNoiseLabel: "Low-noise напоминания",
      balancedLabel: "Полный ритм подсказок",
      principlesTitle: "Для чего эта страница",
      principles: [
        "Персонализация должна усиливать рутину, а не просто украшать интерфейс.",
        "Defaults дневника важны, потому что быстрое фиксирование — повторяющееся ядро продукта.",
        "Подсказки и planning-слой должны быть достаточно спокойными, чтобы сохранять доверие.",
        "Контроли приватности и инсайтов должны существовать до расширения smart-слоя.",
      ],
      roadmapTitle: "Маршрут подключения",
      roadmapItems: [
        {
          label: "Предпочтения, привязанные к профилю",
          detail: "Текущий layout уже готов принять реальные account-backed значения.",
          status: "Готово",
          tone: "ready",
        },
        {
          label: "Правила доставки напоминаний",
          detail: "Окна уведомлений и weekly digest можно подключить следующими без редизайна страницы.",
          status: "Следующий слой",
          tone: "next",
        },
        {
          label: "Пресеты экспорта и retention",
          detail: "Карточки приватности уже оставляют место для реальных правил переносимости данных.",
          status: "Позже",
          tone: "later",
        },
        {
          label: "AI reflection assistant",
          detail: "Smart-summary и тон подсказок уже изолированы, поэтому функция может появляться постепенно.",
          status: "Позже",
          tone: "later",
        },
      ],
    },
    summaryValues: {
      privateDefault: "Приватно по умолчанию",
      shareReady: "Шаринг разрешен",
    },
  },
};

const roleLabels: Record<SettingsPageLocale, Record<UserDto["role"], string>> = {
  en: {
    USER: "Member",
    PREMIUM: "Premium",
    ADMIN: "Administrator",
  },
  ru: {
    USER: "Участник",
    PREMIUM: "Премиум",
    ADMIN: "Администратор",
  },
};

const statusLabels: Record<SettingsPageLocale, { active: string; disabled: string }> = {
  en: {
    active: "Active",
    disabled: "Disabled",
  },
  ru: {
    active: "Активен",
    disabled: "Отключен",
  },
};

type BuildSettingsPagePreviewArgs = {
  locale: SettingsPageLocale;
  user: UserDto | null;
};

type CreateDefaultSettingsPreviewStateArgs = BuildSettingsPagePreviewArgs;

export function createDefaultSettingsPreviewState({
  locale,
  user,
}: CreateDefaultSettingsPreviewStateArgs): SettingsPreviewState {
  const fallbackIdentity = previewDefinition[locale].identityFallback;

  return {
    displayName: user?.fullName ?? fallbackIdentity.name,
    homeView: "diary",
    compactCards: false,
    streakHighlights: true,
    appLanguage: "follow-app",
    timeZone: "auto",
    weekStartsOn: "monday",
    dateFormat: "dmy",
    dayBoundary: "04:00",
    defaultEntryStatus: "planned",
    reflectionTemplate: "guided",
    carryTags: true,
    promptIncomplete: true,
    moodPrompt: true,
    durationUnit: "minutes",
    distanceUnit: "km",
    bodyMetrics: "metric",
    nutritionUnit: "kcal",
    goalResetDay: "monday",
    lowNoiseMode: true,
    morningReminder: "07:30",
    middayReminder: "13:00",
    eveningReminder: "21:00",
    weeklyDigest: true,
    gentleMisses: true,
    carryOverGoals: true,
    defaultRange: "14d",
    comparisonBaseline: "previous-week",
    recoverySignals: true,
    blendGoals: true,
    chartDensity: "comfortable",
    smartPrompts: true,
    routineDrift: true,
    anomalyHints: false,
    insightTone: "gentle",
    privateByDefault: true,
    hideTotals: true,
    shareSnapshots: false,
    exportScope: "summary",
    autoLock: "30m",
    deviceAlerts: true,
    maskMetrics: true,
  };
}

export function buildSettingsPagePreview({
  locale,
  user,
}: BuildSettingsPagePreviewArgs): SettingsPagePreview {
  const localized = previewDefinition[locale];
  const fallbackIdentity = localized.identityFallback;
  const resolvedRole = user ? roleLabels[locale][user.role] : fallbackIdentity.role;
  const resolvedStatus = user
    ? user.enabled
      ? statusLabels[locale].active
      : statusLabels[locale].disabled
    : fallbackIdentity.status;

  return {
    header: localized.header,
    identity: {
      name: user?.fullName.trim() || user?.username || fallbackIdentity.name,
      handle: user?.username ? `@${user.username}` : fallbackIdentity.handle,
      role: resolvedRole,
      status: resolvedStatus,
      trackingSince: fallbackIdentity.trackingSince,
    },
    summaryCards: localized.summaryCards,
    sections: localized.sections,
    templates: localized.templates,
    reminderMoments: localized.reminderMoments,
    digest: localized.digest,
    privacy: {
      integrationsTitle: localized.privacy.integrationsTitle,
      integrationsDescription: localized.privacy.integrationsDescription,
      integrations: localized.privacy.integrations,
      accountTitle: localized.privacy.accountTitle,
      accountDescription: localized.privacy.accountDescription,
      accountFacts: [
        {
          ...localized.privacy.accountFactTemplates.accessLevel,
          value: resolvedRole,
        },
        {
          ...localized.privacy.accountFactTemplates.accountState,
          value: resolvedStatus,
        },
        {
          ...localized.privacy.accountFactTemplates.exportReadiness,
          value:
            locale === "ru"
              ? "Структурная сводка готова"
              : "Structured summary ready",
        },
        {
          ...localized.privacy.accountFactTemplates.trustModel,
          value:
            locale === "ru"
              ? "Ручной контроль + тайм-лок"
              : "Manual control + timed lock",
        },
      ],
    },
    sidebar: localized.sidebar,
    summaryValues: localized.summaryValues,
  };
}
