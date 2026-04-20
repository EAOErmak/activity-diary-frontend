import type { UserDto } from "@/shared/types/user";

export type ProfilePageLocale = "en" | "ru";

export type ProfileHeroInsight = {
  label: string;
  value: string;
  detail: string;
};

export type ProfileSnapshotStat = {
  label: string;
  value: string;
  detail: string;
};

export type ProfileRhythmDay = {
  label: string;
  score: number;
  note: string;
};

export type ProfileTrackingWindow = {
  label: string;
  time: string;
  detail: string;
};

export type ProfileFocusArea = {
  label: string;
  share: number;
  trend: string;
  detail: string;
};

export type ProfileHighlightKind = "reflection" | "goal" | "streak" | "signal";

export type ProfileHighlight = {
  kind: ProfileHighlightKind;
  label: string;
  title: string;
  detail: string;
  meta: string;
};

export type ProfileGoal = {
  label: string;
  progress: number;
  cadence: string;
  streak: string;
  detail: string;
};

export type ProfileMilestone = {
  title: string;
  detail: string;
};

export type ProfilePreference = {
  label: string;
  detail: string;
  enabled: boolean;
};

export type ProfileConnectionState = "ready" | "queued" | "planned";

export type ProfileConnection = {
  label: string;
  description: string;
  state: ProfileConnectionState;
  stateLabel: string;
};

export type ProfileAccountFact = {
  label: string;
  value: string;
  detail: string;
};

export type ProfilePagePreview = {
  header: {
    badge: string;
    description: string;
    identityHint: string;
  };
  hero: {
    name: string;
    handle: string;
    tagline: string;
    summary: string;
    memberSince: string;
    badges: string[];
    insightCards: ProfileHeroInsight[];
    fallbackRole: string;
    fallbackStatus: string;
  };
  snapshotStats: ProfileSnapshotStat[];
  behavior: {
    title: string;
    description: string;
    tabs: {
      rhythm: string;
      focus: string;
      highlights: string;
    };
    rhythmTitle: string;
    rhythmDescription: string;
    rhythmDays: ProfileRhythmDay[];
    anchorTitle: string;
    anchorWindows: ProfileTrackingWindow[];
    rhythmNotesTitle: string;
    rhythmNotes: string[];
    focusTitle: string;
    focusDescription: string;
    focusAreas: ProfileFocusArea[];
    trackingPaletteTitle: string;
    trackingPaletteDescription: string;
    trackingPalette: string[];
    focusNote: string;
    highlightsTitle: string;
    highlightsDescription: string;
    highlights: ProfileHighlight[];
    reflectionCueTitle: string;
    reflectionCueText: string;
    watchListTitle: string;
    watchList: string[];
  };
  goals: {
    title: string;
    description: string;
    items: ProfileGoal[];
  };
  milestones: {
    title: string;
    description: string;
    items: ProfileMilestone[];
    nextMilestoneLabel: string;
    nextMilestoneValue: string;
    nextMilestoneProgress: number;
    nextMilestoneDetail: string;
  };
  setup: {
    title: string;
    description: string;
    preferences: ProfilePreference[];
    privacyTitle: string;
    privacyFacts: ProfileAccountFact[];
    connectionsTitle: string;
    connections: ProfileConnection[];
  };
};

type LocalizedPreviewDefinition = {
  header: ProfilePagePreview["header"];
  hero: Omit<ProfilePagePreview["hero"], "name" | "handle" | "fallbackRole" | "fallbackStatus">;
  fallbackIdentity: {
    name: string;
    handle: string;
    role: string;
    status: string;
  };
  snapshotStats: ProfileSnapshotStat[];
  behavior: ProfilePagePreview["behavior"];
  goals: ProfilePagePreview["goals"];
  milestones: ProfilePagePreview["milestones"];
  setup: Omit<ProfilePagePreview["setup"], "privacyFacts"> & {
    privacyFactsTemplate: {
      visibility: Omit<ProfileAccountFact, "value">;
      accountState: Omit<ProfileAccountFact, "value">;
      access: Omit<ProfileAccountFact, "value">;
      exportReadiness: Omit<ProfileAccountFact, "value">;
    };
  };
};

const previewDefinition: Record<ProfilePageLocale, LocalizedPreviewDefinition> = {
  en: {
    header: {
      badge: "Personal Layer",
      description:
        "A quieter profile view for identity, rhythm, goals, reflection, and future personalization.",
      identityHint:
        "Live identity is unavailable right now, so the page falls back to a neutral profile preview.",
    },
    hero: {
      tagline: "Builds calmer weeks and tracks quality before volume.",
      summary:
        "The current footprint reads like a user who prefers stable routines, short reviews, and a compact set of reliable signals.",
      memberSince: "Tracking since February 2026",
      badges: ["Evening reflections", "Goal-led weeks", "Tags + metrics"],
      insightCards: [
        {
          label: "This season",
          value: "Steady mornings",
          detail: "Protect the first hour before the day becomes reactive.",
        },
        {
          label: "Logging pattern",
          value: "Morning plan + evening review",
          detail: "Two short check-ins keep the diary meaningful without adding noise.",
        },
        {
          label: "Main lens",
          value: "Consistency over intensity",
          detail: "Reliable rhythm matters more than rare perfect days.",
        },
      ],
    },
    fallbackIdentity: {
      name: "Reflective user",
      handle: "@activity_diary",
      role: "Personal workspace",
      status: "Preview mode",
    },
    snapshotStats: [
      {
        label: "Consistency",
        value: "82%",
        detail: "Days with at least one meaningful diary signal during the last two weeks.",
      },
      {
        label: "Diary entries",
        value: "126",
        detail: "A believable base for surfacing trends, milestones, and reflection patterns.",
      },
      {
        label: "Active goals",
        value: "4",
        detail: "Enough commitments to show intent without turning the profile into a dashboard.",
      },
      {
        label: "Signals in use",
        value: "9",
        detail: "Tags, metrics, streaks, and review habits that shape the personal footprint.",
      },
    ],
    behavior: {
      title: "Behavior profile",
      description:
        "Signals that explain how the diary is used, not only what account owns it.",
      tabs: {
        rhythm: "Rhythm",
        focus: "Focus",
        highlights: "Highlights",
      },
      rhythmTitle: "Weekly stability",
      rhythmDescription:
        "The strongest days combine a planned morning, one meaningful block, and a brief evening review.",
      rhythmDays: [
        { label: "Mon", score: 78, note: "Good restart" },
        { label: "Tue", score: 92, note: "Deep work held" },
        { label: "Wed", score: 84, note: "Training logged" },
        { label: "Thu", score: 67, note: "Late review" },
        { label: "Fri", score: 88, note: "Clean close-out" },
        { label: "Sat", score: 72, note: "Light tracking" },
        { label: "Sun", score: 64, note: "Weekly reset" },
      ],
      anchorTitle: "Anchor rituals",
      anchorWindows: [
        {
          label: "Morning plan",
          time: "07:30-08:15",
          detail: "Best window for setting intent before tasks and messages take over.",
        },
        {
          label: "Midday reset",
          time: "13:00-13:20",
          detail: "Used to re-prioritize goals, food, and energy before the afternoon dips.",
        },
        {
          label: "Evening review",
          time: "21:00-21:20",
          detail: "Short reflections keep streaks honest and make analytics more useful later.",
        },
      ],
      rhythmNotesTitle: "What stands out",
      rhythmNotes: [
        "Weeks feel strongest when the first logged item appears before 09:00.",
        "Short review habits outperform long journaling sessions for consistency.",
        "Weekend logging gets lighter, but weekly resets still preserve continuity.",
      ],
      focusTitle: "Current focus areas",
      focusDescription:
        "Themes that currently shape most entries, tags, and metrics in the diary.",
      focusAreas: [
        {
          label: "Deep work",
          share: 36,
          trend: "Rising",
          detail: "Sessions with fewer switches and clearer start-stop boundaries.",
        },
        {
          label: "Recovery",
          share: 28,
          trend: "Stable",
          detail: "Sleep, rest, and low-friction routines hold the week together.",
        },
        {
          label: "Training",
          share: 21,
          trend: "Measured",
          detail: "Less volume, better repeatability, and cleaner post-workout notes.",
        },
        {
          label: "Nutrition",
          share: 15,
          trend: "Returning",
          detail: "More attention to structure than calorie perfection.",
        },
      ],
      trackingPaletteTitle: "Tracking palette",
      trackingPaletteDescription:
        "A believable mix of entities that a mature profile page should surface over time.",
      trackingPalette: [
        "#deep-work",
        "#sleep",
        "#mobility",
        "#protein",
        "#evening-review",
        "Metric: mood",
        "Metric: duration",
        "Templates",
      ],
      focusNote:
        "The mix suggests a user who treats the product as a reflective control panel, not just a log archive.",
      highlightsTitle: "Recent highlights",
      highlightsDescription:
        "Moments that would help the profile tell a story once live diary data is connected.",
      highlights: [
        {
          kind: "streak",
          label: "Consistency",
          title: "Three calm mornings in a row",
          detail: "The day started on plan before any reactive tasks appeared.",
          meta: "Yesterday",
        },
        {
          kind: "goal",
          label: "Goal progress",
          title: "Training cadence stayed on target",
          detail: "The weekly plan was met without expanding the time budget.",
          meta: "2 days ago",
        },
        {
          kind: "reflection",
          label: "Review note",
          title: "Evening review reopened the priority list",
          detail: "One note moved the next day back toward sleep and deep work.",
          meta: "This week",
        },
        {
          kind: "signal",
          label: "Analytics cue",
          title: "Sleep notes stopped going missing",
          detail: "The signal is now consistent enough to support later trend views.",
          meta: "This week",
        },
        {
          kind: "reflection",
          label: "Reflection",
          title: "Lower ambition produced a cleaner week",
          detail: "Fewer planned items led to stronger follow-through and less friction.",
          meta: "Weekly review",
        },
      ],
      reflectionCueTitle: "Reflection cue",
      reflectionCueText:
        "Your strongest weeks start with lower ambition and better follow-through.",
      watchListTitle: "Worth watching",
      watchList: [
        "Evening review quality drops when the last log happens too late.",
        "Training days improve when food is logged before lunch, not after.",
        "Short daily wins make weekly goals feel safer and more repeatable.",
      ],
    },
    goals: {
      title: "Goals and streaks",
      description:
        "Commitments stay close to the profile because they explain intent, not just output.",
      items: [
        {
          label: "Protect the first hour",
          progress: 74,
          cadence: "Daily focus block",
          streak: "9-day streak",
          detail: "Keep the first work block distraction-light and planned in advance.",
        },
        {
          label: "Keep weekly training cadence",
          progress: 63,
          cadence: "3 sessions this week",
          streak: "4 active weeks",
          detail: "Maintain repeatable effort instead of chasing peak volume.",
        },
        {
          label: "Close each day with a short review",
          progress: 67,
          cadence: "14 of 21 reviews",
          streak: "Reflection habit",
          detail: "End the day with one concise note and one next-step adjustment.",
        },
      ],
    },
    milestones: {
      title: "Milestones",
      description:
        "Milestones give the profile a sense of path, history, and earned momentum.",
      items: [
        {
          title: "100 structured diary entries",
          detail: "Enough history to make profile insights feel grounded instead of decorative.",
        },
        {
          title: "First template-led week",
          detail: "A sign that the user moved from raw logging into intentional routines.",
        },
        {
          title: "14-day consistency band",
          detail: "The point where the product starts feeling like a companion, not a tool.",
        },
      ],
      nextMilestoneLabel: "Next milestone",
      nextMilestoneValue: "21-day evening review streak",
      nextMilestoneProgress: 67,
      nextMilestoneDetail: "14 of 21 days completed",
    },
    setup: {
      title: "Personal setup",
      description:
        "Future-facing preferences and account signals that shape the experience without taking over the page.",
      preferences: [
        {
          label: "Evening review reminder",
          detail: "Keeps the last diary action lightweight and repeatable.",
          enabled: true,
        },
        {
          label: "Low-noise notifications",
          detail: "Fewer prompts, only around review windows and missed commitments.",
          enabled: true,
        },
        {
          label: "Private reflection snippets",
          detail: "Reflection notes stay personal unless sharing controls are added later.",
          enabled: true,
        },
        {
          label: "Shareable insight cards",
          detail: "Reserved for future exports or coaching-style summaries.",
          enabled: false,
        },
      ],
      privacyTitle: "Privacy and account",
      privacyFactsTemplate: {
        visibility: {
          label: "Diary visibility",
          detail: "The profile should surface privacy posture without dominating the screen.",
        },
        accountState: {
          label: "Account state",
          detail: "Basic access state still belongs here because it affects trust.",
        },
        access: {
          label: "Current access",
          detail: "Role or plan should remain visible, but secondary to behavior and goals.",
        },
        exportReadiness: {
          label: "Export readiness",
          detail: "A future profile should know whether summaries can leave the product cleanly.",
        },
      },
      connectionsTitle: "Connected features",
      connections: [
        {
          label: "Weekly digest",
          description: "A future summary stream for consistency, focus, and review notes.",
          state: "ready",
          stateLabel: "Ready",
        },
        {
          label: "Calendar bridge",
          description: "Useful later for matching planned days against lived days.",
          state: "queued",
          stateLabel: "Queued",
        },
        {
          label: "Wearable import",
          description: "A natural place for recovery and movement signals once integrations arrive.",
          state: "planned",
          stateLabel: "Planned",
        },
      ],
    },
  },
  ru: {
    header: {
      badge: "Личный слой",
      description:
        "Спокойный профильный экран для identity, ритма, целей, рефлексии и будущей персонализации.",
      identityHint:
        "Живая identity пользователя сейчас недоступна, поэтому страница показывает нейтральный preview-профиль.",
    },
    hero: {
      tagline: "Строит более спокойные недели и отслеживает качество раньше, чем объем.",
      summary:
        "Текущий след внутри продукта похож на пользователя, который держится за стабильные ритуалы, короткие обзоры и небольшой набор надежных сигналов.",
      memberSince: "Ведет трекинг с февраля 2026",
      badges: ["Вечерние обзоры", "Недели от целей", "Теги + метрики"],
      insightCards: [
        {
          label: "Сейчас в фокусе",
          value: "Устойчивое утро",
          detail: "Защитить первый час дня, пока неделя не стала реактивной.",
        },
        {
          label: "Паттерн ведения",
          value: "Утренний план + вечерний обзор",
          detail: "Два коротких чек-ина делают дневник полезным без лишнего шума.",
        },
        {
          label: "Главная оптика",
          value: "Стабильность важнее интенсивности",
          detail: "Надежный ритм ценнее редких идеальных дней.",
        },
      ],
    },
    fallbackIdentity: {
      name: "Вдумчивый пользователь",
      handle: "@activity_diary",
      role: "Личное рабочее пространство",
      status: "Preview-режим",
    },
    snapshotStats: [
      {
        label: "Стабильность",
        value: "82%",
        detail: "Дни, в которых за последние две недели появился хотя бы один осмысленный сигнал дневника.",
      },
      {
        label: "Записи дневника",
        value: "126",
        detail: "Достаточная база, чтобы в будущем показывать тренды, milestones и паттерны рефлексии.",
      },
      {
        label: "Активные цели",
        value: "4",
        detail: "Достаточно обязательств, чтобы видеть намерение, но не превращать профиль в dashboard.",
      },
      {
        label: "Сигналы в работе",
        value: "9",
        detail: "Теги, метрики, streaks и review-привычки, из которых складывается личный след.",
      },
    ],
    behavior: {
      title: "Поведенческий профиль",
      description:
        "Сигналы, которые объясняют, как пользователь живет в дневнике, а не только кому принадлежит аккаунт.",
      tabs: {
        rhythm: "Ритм",
        focus: "Фокус",
        highlights: "Хайлайты",
      },
      rhythmTitle: "Стабильность недели",
      rhythmDescription:
        "Самые сильные дни сочетают утренний план, один важный блок и короткий вечерний обзор.",
      rhythmDays: [
        { label: "Пн", score: 78, note: "Хороший старт" },
        { label: "Вт", score: 92, note: "Удержан deep work" },
        { label: "Ср", score: 84, note: "Тренировка записана" },
        { label: "Чт", score: 67, note: "Поздний обзор" },
        { label: "Пт", score: 88, note: "Чистое завершение" },
        { label: "Сб", score: 72, note: "Легкий трекинг" },
        { label: "Вс", score: 64, note: "Пересбор недели" },
      ],
      anchorTitle: "Опорные ритуалы",
      anchorWindows: [
        {
          label: "Утренний план",
          time: "07:30-08:15",
          detail: "Лучшее окно, чтобы задать намерение до задач, сообщений и суеты.",
        },
        {
          label: "Дневной reset",
          time: "13:00-13:20",
          detail: "Нужен, чтобы вернуть приоритеты, еду и энергию в управляемое состояние.",
        },
        {
          label: "Вечерний обзор",
          time: "21:00-21:20",
          detail: "Короткая рефлексия делает streaks честными, а будущую аналитику более полезной.",
        },
      ],
      rhythmNotesTitle: "Что заметно",
      rhythmNotes: [
        "Недели держатся лучше, когда первая запись появляется до 09:00.",
        "Короткие обзоры дают больше стабильности, чем длинные journaling-сессии.",
        "На выходных логирование становится легче, но weekly reset все равно сохраняет непрерывность.",
      ],
      focusTitle: "Текущие зоны внимания",
      focusDescription:
        "Темы, которые сейчас сильнее всего формируют записи, теги и метрики внутри дневника.",
      focusAreas: [
        {
          label: "Deep work",
          share: 36,
          trend: "Растет",
          detail: "Сессии стали чище: меньше переключений и понятнее границы начала и конца.",
        },
        {
          label: "Восстановление",
          share: 28,
          trend: "Стабильно",
          detail: "Сон, отдых и низкофрикционные ритуалы удерживают неделю в форме.",
        },
        {
          label: "Тренировки",
          share: 21,
          trend: "Осознанно",
          detail: "Меньше объема, выше повторяемость и аккуратнее post-workout заметки.",
        },
        {
          label: "Питание",
          share: 15,
          trend: "Возвращается",
          detail: "Фокус больше на структуре, чем на идеальной калорийности.",
        },
      ],
      trackingPaletteTitle: "Палитра трекинга",
      trackingPaletteDescription:
        "Правдоподобный набор сущностей, которые mature profile page должен уметь показывать со временем.",
      trackingPalette: [
        "#deep-work",
        "#sleep",
        "#mobility",
        "#protein",
        "#evening-review",
        "Метрика: mood",
        "Метрика: duration",
        "Шаблоны",
      ],
      focusNote:
        "По этому набору видно пользователя, который использует продукт как рефлексивную панель управления, а не как архив логов.",
      highlightsTitle: "Недавние хайлайты",
      highlightsDescription:
        "События, которые помогали бы профилю рассказывать историю после подключения живых данных.",
      highlights: [
        {
          kind: "streak",
          label: "Стабильность",
          title: "Три спокойных утра подряд",
          detail: "День начинался по плану до того, как появился реактивный поток задач.",
          meta: "Вчера",
        },
        {
          kind: "goal",
          label: "Прогресс цели",
          title: "Тренировочный ритм остался в пределах плана",
          detail: "Недельная схема выполнена без раздувания временного бюджета.",
          meta: "2 дня назад",
        },
        {
          kind: "reflection",
          label: "Review note",
          title: "Вечерний обзор вернул список приоритетов",
          detail: "Одна заметка сместила следующий день обратно к сну и deep work.",
          meta: "На этой неделе",
        },
        {
          kind: "signal",
          label: "Аналитический сигнал",
          title: "Заметки про сон перестали выпадать",
          detail: "Сигнал уже достаточно стабилен, чтобы позже показывать тренды.",
          meta: "На этой неделе",
        },
        {
          kind: "reflection",
          label: "Рефлексия",
          title: "Меньше амбиций дало более чистую неделю",
          detail: "Меньше запланированных единиц дало выше follow-through и меньше трения.",
          meta: "Недельный обзор",
        },
      ],
      reflectionCueTitle: "Рефлексивная подсказка",
      reflectionCueText:
        "Лучшие недели начинаются там, где амбиции чуть ниже, а follow-through заметно сильнее.",
      watchListTitle: "Стоит наблюдать",
      watchList: [
        "Качество вечернего обзора падает, когда последняя запись появляется слишком поздно.",
        "Тренировочные дни проходят лучше, если еда зафиксирована до обеда, а не после.",
        "Маленькие ежедневные победы делают недельные цели безопаснее и повторяемее.",
      ],
    },
    goals: {
      title: "Цели и streaks",
      description:
        "Цели должны быть рядом с профилем, потому что они объясняют намерение, а не только результат.",
      items: [
        {
          label: "Защитить первый час дня",
          progress: 74,
          cadence: "Ежедневный фокус-блок",
          streak: "Streak 9 дней",
          detail: "Первый рабочий блок остается спокойным и заранее спроектированным.",
        },
        {
          label: "Сохранить недельный ритм тренировок",
          progress: 63,
          cadence: "3 сессии на этой неделе",
          streak: "4 активные недели",
          detail: "Повторяемое усилие важнее пикового объема.",
        },
        {
          label: "Закрывать день коротким обзором",
          progress: 67,
          cadence: "14 из 21 обзора",
          streak: "Рефлективная привычка",
          detail: "Каждый день заканчивается одной заметкой и одной корректировкой следующего шага.",
        },
      ],
    },
    milestones: {
      title: "Milestones",
      description:
        "Milestones дают профилю чувство пути, истории и накопленного импульса внутри продукта.",
      items: [
        {
          title: "100 структурированных записей",
          detail: "Точка, после которой инсайты профиля начинают ощущаться заслуженными, а не декоративными.",
        },
        {
          title: "Первая неделя через шаблоны",
          detail: "Признак перехода от сырого логирования к намеренным ритуалам.",
        },
        {
          title: "14-дневный коридор стабильности",
          detail: "Момент, когда продукт начинает ощущаться спутником, а не просто инструментом.",
        },
      ],
      nextMilestoneLabel: "Следующий milestone",
      nextMilestoneValue: "Streak 21 день по вечернему обзору",
      nextMilestoneProgress: 67,
      nextMilestoneDetail: "14 из 21 дней завершены",
    },
    setup: {
      title: "Персональная настройка",
      description:
        "Будущие preferences и account-сигналы, которые влияют на опыт, но не перетягивают страницу на себя.",
      preferences: [
        {
          label: "Напоминание о вечернем обзоре",
          detail: "Держит последнее действие дня коротким и повторяемым.",
          enabled: true,
        },
        {
          label: "Low-noise уведомления",
          detail: "Меньше подсказок, только возле review-окон и пропущенных commitments.",
          enabled: true,
        },
        {
          label: "Приватные фрагменты рефлексии",
          detail: "Личные заметки остаются приватными, пока позже не появятся share-контроли.",
          enabled: true,
        },
        {
          label: "Shareable insight cards",
          detail: "Заготовка под будущий экспорт или coaching-style summaries.",
          enabled: false,
        },
      ],
      privacyTitle: "Приватность и аккаунт",
      privacyFactsTemplate: {
        visibility: {
          label: "Видимость дневника",
          detail: "Профиль должен показывать posture приватности, но не захватывать всю страницу.",
        },
        accountState: {
          label: "Состояние аккаунта",
          detail: "Базовый access-state все равно важен, потому что влияет на доверие.",
        },
        access: {
          label: "Текущий доступ",
          detail: "Роль или план должны быть видны, но оставаться вторичными относительно ритма и целей.",
        },
        exportReadiness: {
          label: "Готовность к экспорту",
          detail: "Будущий профиль должен понимать, можно ли чисто выводить summary наружу.",
        },
      },
      connectionsTitle: "Подключаемые функции",
      connections: [
        {
          label: "Weekly digest",
          description: "Будущий поток сводок по стабильности, фокусу и review-заметкам.",
          state: "ready",
          stateLabel: "Готово",
        },
        {
          label: "Calendar bridge",
          description: "Нужен позже, чтобы сравнивать планируемые дни с реально прожитыми.",
          state: "queued",
          stateLabel: "В очереди",
        },
        {
          label: "Wearable import",
          description: "Естественное место для recovery и movement-сигналов после появления интеграций.",
          state: "planned",
          stateLabel: "Запланировано",
        },
      ],
    },
  },
};

type BuildProfilePagePreviewArgs = {
  locale: ProfilePageLocale;
  user: UserDto | null;
  roleLabel?: string;
  statusLabel?: string;
};

export function buildProfilePagePreview({
  locale,
  user,
  roleLabel,
  statusLabel,
}: BuildProfilePagePreviewArgs): ProfilePagePreview {
  const localized = previewDefinition[locale];
  const identity = localized.fallbackIdentity;

  const resolvedName = user?.fullName.trim() || user?.username || identity.name;
  const resolvedHandle = user?.username ? `@${user.username}` : identity.handle;
  const resolvedRole = user ? roleLabel ?? user.role : identity.role;
  const resolvedStatus = user ? statusLabel ?? identity.status : identity.status;

  return {
    header: localized.header,
    hero: {
      ...localized.hero,
      name: resolvedName,
      handle: resolvedHandle,
      fallbackRole: resolvedRole,
      fallbackStatus: resolvedStatus,
    },
    snapshotStats: localized.snapshotStats,
    behavior: localized.behavior,
    goals: localized.goals,
    milestones: localized.milestones,
    setup: {
      title: localized.setup.title,
      description: localized.setup.description,
      preferences: localized.setup.preferences,
      privacyTitle: localized.setup.privacyTitle,
      privacyFacts: [
        {
          ...localized.setup.privacyFactsTemplate.visibility,
          value: locale === "ru" ? "Личный дневник по умолчанию" : "Private by default",
        },
        {
          ...localized.setup.privacyFactsTemplate.accountState,
          value: resolvedStatus,
        },
        {
          ...localized.setup.privacyFactsTemplate.access,
          value: resolvedRole,
        },
        {
          ...localized.setup.privacyFactsTemplate.exportReadiness,
          value: locale === "ru" ? "Структурированная сводка готова" : "Structured summary ready",
        },
      ],
      connectionsTitle: localized.setup.connectionsTitle,
      connections: localized.setup.connections,
    },
  };
}
