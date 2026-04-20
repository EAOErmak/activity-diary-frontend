
import { Fragment, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  Clock3,
  LineChart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCog,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { useCurrentUserStore } from "@/shared/store/currentUserStore";
import {
  buildSettingsPagePreview,
  createDefaultSettingsPreviewState,
  type SettingsIntegration,
  type SettingsPageLocale,
  type SettingsPanel,
  type SettingsPreviewState,
  type SettingsRoadmapItem,
  type SettingsSection,
  type SettingsSectionId,
  type SettingsSummaryCardMeta,
} from "./settingsPagePreview";

const sectionIconMap: Record<SettingsSectionId, LucideIcon> = {
  experience: UserRoundCog,
  diary: NotebookPen,
  planning: Target,
  insights: BrainCircuit,
  privacy: ShieldCheck,
};

const summaryIconMap: Record<SettingsSummaryCardMeta["id"], LucideIcon> = {
  reflection: Clock3,
  tracking: NotebookPen,
  analytics: LineChart,
  privacy: ShieldCheck,
};

const roadmapToneMap: Record<
  SettingsRoadmapItem["tone"],
  { container: string; badge: string }
> = {
  ready: {
    container: "border-primary/20 bg-primary/5",
    badge: "border-primary/20 bg-primary/10 text-primary",
  },
  next: {
    container: "border-border/70 bg-surfaceMuted/60",
    badge: "border-border/70 bg-background text-foreground",
  },
  later: {
    container: "border-border/70 bg-background/85",
    badge: "border-border/70 bg-surface text-mutedForeground",
  },
};

const integrationToneMap: Record<
  SettingsIntegration["tone"],
  { container: string; badge: string }
> = {
  ready: {
    container: "border-primary/20 bg-primary/5",
    badge: "border-primary/20 bg-primary/10 text-primary",
  },
  queued: {
    container: "border-border/70 bg-surfaceMuted/60",
    badge: "border-border/70 bg-background text-foreground",
  },
  planned: {
    container: "border-border/70 bg-background/85",
    badge: "border-border/70 bg-surface text-mutedForeground",
  },
};

type SettingsValueUpdater = <K extends keyof SettingsPreviewState>(
  key: K,
  value: SettingsPreviewState[K]
) => void;

function getInitials(name: string, handle: string) {
  const normalizedName = name.trim();

  if (normalizedName.length > 0) {
    const initials = normalizedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    if (initials) {
      return initials;
    }
  }

  return handle.replace("@", "").slice(0, 2).toUpperCase() || "AD";
}

function findOptionLabel(
  sections: SettingsSection[],
  key: keyof SettingsPreviewState,
  value: string
) {
  for (const section of sections) {
    for (const panel of section.panels) {
      for (const row of panel.rows) {
        if (row.kind === "select" && row.id === key) {
          return row.options.find((option) => option.value === value)?.label ?? value;
        }
      }
    }
  }

  return value;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border border-border/70 bg-surface shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surfaceMuted/80 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
            {label}
          </p>
          <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>

        <p className="text-sm leading-6 text-mutedForeground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SettingsPanelCard({
  panel,
  state,
  onValueChange,
}: {
  panel: SettingsPanel;
  state: SettingsPreviewState;
  onValueChange: SettingsValueUpdater;
}) {
  return (
    <Card className="border border-border/70 bg-surface shadow-none">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-border/70 bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-mutedForeground"
          >
            {panel.badge}
          </Badge>
        </div>
        <CardTitle className="text-xl">{panel.title}</CardTitle>
        <CardDescription className="text-sm leading-6 text-mutedForeground">
          {panel.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {panel.rows.map((row, index) => {
          const fieldId = `${panel.badge}-${String(row.id)}`;

          return (
            <Fragment key={String(row.id)}>
              <div className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background/85 p-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor={fieldId} className="text-sm font-semibold text-foreground">
                      {row.label}
                    </Label>
                    {row.badge ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/70 bg-surface px-2.5 py-1 text-[11px] text-mutedForeground"
                      >
                        {row.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-mutedForeground">{row.description}</p>
                </div>

                <div className="w-full sm:max-w-[280px]">
                  {row.kind === "switch" ? (
                    <div className="flex h-12 items-center justify-end rounded-[22px] border border-border/70 bg-surface px-4">
                      <Switch
                        id={fieldId}
                        checked={state[row.id] as boolean}
                        onCheckedChange={(checked) =>
                          onValueChange(row.id, checked as SettingsPreviewState[typeof row.id])
                        }
                        aria-label={row.label}
                      />
                    </div>
                  ) : null}

                  {row.kind === "select" ? (
                    <Select
                      value={state[row.id] as string}
                      onValueChange={(value) =>
                        onValueChange(row.id, value as SettingsPreviewState[typeof row.id])
                      }
                    >
                      <SelectTrigger id={fieldId}>
                        <SelectValue placeholder={row.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {row.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {row.kind === "input" ? (
                    <Input
                      id={fieldId}
                      type={row.inputType ?? "text"}
                      value={state[row.id] as string}
                      placeholder={row.placeholder}
                      onChange={(event) =>
                        onValueChange(
                          row.id,
                          event.target.value as SettingsPreviewState[typeof row.id]
                        )
                      }
                    />
                  ) : null}
                </div>
              </div>

              {index < panel.rows.length - 1 ? <Separator className="bg-border/70" /> : null}
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const user = useCurrentUserStore((state) => state.user);

  const locale: SettingsPageLocale =
    i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "en";

  const preview = useMemo(
    () => buildSettingsPagePreview({ locale, user }),
    [locale, user]
  );

  const [state, setState] = useState<SettingsPreviewState>(() =>
    createDefaultSettingsPreviewState({ locale, user })
  );

  const updateValue: SettingsValueUpdater = (key, value) => {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetPreview = () => {
    setState(createDefaultSettingsPreviewState({ locale, user }));
  };

  const displayName = state.displayName.trim() || preview.identity.name;
  const initials = getInitials(displayName, preview.identity.handle);

  const homeViewLabel = findOptionLabel(preview.sections, "homeView", state.homeView);
  const weekStartsOnLabel = findOptionLabel(
    preview.sections,
    "weekStartsOn",
    state.weekStartsOn
  );
  const goalResetDayLabel = findOptionLabel(
    preview.sections,
    "goalResetDay",
    state.goalResetDay
  );
  const defaultRangeLabel = findOptionLabel(
    preview.sections,
    "defaultRange",
    state.defaultRange
  );
  const comparisonBaselineLabel = findOptionLabel(
    preview.sections,
    "comparisonBaseline",
    state.comparisonBaseline
  );
  const insightToneLabel = findOptionLabel(
    preview.sections,
    "insightTone",
    state.insightTone
  );
  const exportScopeLabel = findOptionLabel(
    preview.sections,
    "exportScope",
    state.exportScope
  );

  const summaryValues: Record<SettingsSummaryCardMeta["id"], string> = {
    reflection: state.weeklyDigest
      ? `${state.eveningReminder} + ${
          locale === "ru" ? "обзор недели" : "weekly digest"
        }`
      : state.eveningReminder,
    tracking: `${weekStartsOnLabel} / ${state.dayBoundary}`,
    analytics: `${defaultRangeLabel} / ${comparisonBaselineLabel}`,
    privacy: state.privateByDefault
      ? preview.summaryValues.privateDefault
      : preview.summaryValues.shareReady,
  };

  const blendItems = [
    {
      label: locale === "ru" ? "Стартовый экран" : "Start surface",
      value: homeViewLabel,
    },
    {
      label: locale === "ru" ? "Режим напоминаний" : "Reminder mode",
      value: state.lowNoiseMode
        ? preview.sidebar.lowNoiseLabel
        : preview.sidebar.balancedLabel,
    },
    {
      label: locale === "ru" ? "Тон инсайтов" : "Insight tone",
      value: insightToneLabel,
    },
    {
      label: locale === "ru" ? "Объем экспорта" : "Export scope",
      value: exportScopeLabel,
    },
  ];

  const reminderValues = [
    state.morningReminder,
    state.middayReminder,
    state.eveningReminder,
    state.weeklyDigest ? goalResetDayLabel : preview.reminderMoments.digestOffValue,
  ];

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Card className="overflow-hidden border border-border/70 bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div
            className="relative"
            style={{
              background:
                "radial-gradient(circle at top left, hsl(var(--primary) / 0.16), transparent 38%), radial-gradient(circle at bottom right, hsl(var(--primary) / 0.08), transparent 32%)",
            }}
          >
            <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className="inline-flex w-fit rounded-full border-border/70 bg-surface/80 px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-mutedForeground"
                  >
                    {preview.header.badge}
                  </Badge>

                  <div className="space-y-2">
                    <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">
                      {preview.header.title}
                    </h1>
                    <p className="max-w-3xl text-sm leading-7 text-mutedForeground sm:text-base">
                      {preview.header.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {preview.header.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-xs text-mutedForeground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-primary/15 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {preview.header.previewTitle}
                      </p>
                      <p className="text-sm leading-6 text-mutedForeground">
                        {preview.header.previewText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-border/70 bg-background/85 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border border-border/70 shadow-sm">
                      <AvatarFallback className="bg-primary/15 text-xl font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xl font-semibold text-foreground">{displayName}</div>
                        <div className="text-sm text-mutedForeground">
                          {preview.identity.handle}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/70 bg-surface px-3 py-1 text-xs"
                        >
                          {preview.identity.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/70 bg-surface px-3 py-1 text-xs text-mutedForeground"
                        >
                          {preview.identity.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/70 bg-surface px-3 py-1 text-xs text-mutedForeground"
                        >
                          {preview.identity.trackingSince}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-[28px] border border-border/70 bg-background/85 p-5 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {preview.header.previewTitle}
                    </p>
                    <p className="text-sm leading-6 text-mutedForeground">
                      {preview.header.saveHint}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Button variant="surface" className="justify-center" onClick={resetPreview}>
                      {preview.header.resetLabel}
                    </Button>
                    <Button variant="primary" className="justify-center" disabled>
                      {preview.header.saveLabel}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {preview.summaryCards.map((card) => {
            const Icon = summaryIconMap[card.id];

            return (
              <SummaryCard
                key={card.id}
                icon={Icon}
                label={card.label}
                value={summaryValues[card.id]}
                detail={card.detail}
              />
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] xl:items-start">
          <div className="min-w-0">
            <Tabs defaultValue={preview.sections[0]?.id} className="space-y-6">
              <Card className="border border-border/70 bg-surface shadow-none">
                <CardContent className="p-3">
                  <TabsList className="grid h-auto w-full grid-cols-1 gap-3 rounded-[28px] bg-surface/40 p-2 md:grid-cols-2 xl:grid-cols-5">
                    {preview.sections.map((section) => {
                      const Icon = sectionIconMap[section.id];

                      return (
                        <TabsTrigger
                          key={section.id}
                          value={section.id}
                          className={cn(
                            "group relative h-auto min-h-[104px] items-start overflow-hidden rounded-[24px] border border-border/70 bg-background p-4 text-left shadow-sm hover:border-border hover:bg-surface/60",
                            "data-[state=active]:border-foreground/10 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
                          )}
                        >
                          <div className="flex w-full flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                                  "border-border bg-surface text-foreground",
                                  "group-data-[state=active]:border-white/15 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-white"
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>

                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]",
                                  "border-border/70 bg-surface text-mutedForeground",
                                  "group-data-[state=active]:border-white/15 group-data-[state=active]:bg-white/10 group-data-[state=active]:text-white/85"
                                )}
                              >
                                {section.label}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <div className="text-base font-semibold">{section.label}</div>
                              <div className="text-sm leading-6 text-mutedForeground group-data-[state=active]:text-white/70">
                                {section.description}
                              </div>
                            </div>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </CardContent>
              </Card>

              {preview.sections.map((section) => {
                const SectionIcon = sectionIconMap[section.id];

                return (
                  <TabsContent key={section.id} value={section.id} className="m-0 space-y-6">
                    <Card className="border border-primary/15 bg-primary/5 shadow-none">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                          <SectionIcon className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {section.noteTitle}
                          </p>
                          <p className="text-sm leading-6 text-mutedForeground">{section.note}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-6 xl:grid-cols-2">
                      {section.panels.map((panel) => (
                        <SettingsPanelCard
                          key={panel.title}
                          panel={panel}
                          state={state}
                          onValueChange={updateValue}
                        />
                      ))}
                    </div>

                    {section.id === "diary" ? (
                      <Card className="border border-border/70 bg-surface shadow-none">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-xl">{preview.templates.title}</CardTitle>
                          <CardDescription className="text-sm leading-6 text-mutedForeground">
                            {preview.templates.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {preview.templates.items.map((item) => (
                              <Badge
                                key={item}
                                variant="outline"
                                className="rounded-full border-border/70 bg-background px-3 py-1 text-xs text-mutedForeground"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>

                          <div className="rounded-[22px] border border-border/70 bg-background/85 p-4 text-sm leading-6 text-mutedForeground">
                            {locale === "ru"
                              ? "Позже этот блок сможет связывать defaults дневника с готовыми entry templates, чтобы повторяющиеся дни собирались быстрее."
                              : "Later this block can connect diary defaults with entry templates so repeated days assemble faster and with less friction."}
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}

                    {section.id === "planning" ? (
                      <Card className="border border-border/70 bg-surface shadow-none">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-xl">{preview.reminderMoments.title}</CardTitle>
                          <CardDescription className="text-sm leading-6 text-mutedForeground">
                            {preview.reminderMoments.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {preview.reminderMoments.items.map((item, index) => (
                            <div
                              key={item.label}
                              className="rounded-[22px] border border-border/70 bg-background/85 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-foreground">
                                    {item.label}
                                  </p>
                                  <p className="text-sm leading-6 text-mutedForeground">
                                    {item.detail}
                                  </p>
                                </div>

                                <div className="space-y-2 text-right">
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-border/70 bg-surface px-2.5 py-1 text-xs text-mutedForeground"
                                  >
                                    {item.phase}
                                  </Badge>
                                  <div className="text-sm font-semibold text-foreground">
                                    {reminderValues[index] ?? preview.reminderMoments.digestOffValue}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : null}

                    {section.id === "insights" ? (
                      <Card className="border border-border/70 bg-surface shadow-none">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-xl">{preview.digest.title}</CardTitle>
                          <CardDescription className="text-sm leading-6 text-mutedForeground">
                            {preview.digest.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <ScrollArea className="h-[20rem] pr-4">
                            <div className="space-y-3">
                              {preview.digest.items.map((item) => (
                                <div
                                  key={item.label}
                                  className="rounded-[24px] border border-border/70 bg-background/85 p-4"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-foreground">
                                      {item.label}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="rounded-full border-border/70 bg-surface px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-mutedForeground"
                                    >
                                      {item.badge}
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-mutedForeground">
                                    {item.detail}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ) : null}

                    {section.id === "privacy" ? (
                      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
                        <Card className="border border-border/70 bg-surface shadow-none">
                          <CardHeader className="space-y-2">
                            <CardTitle className="text-xl">{preview.privacy.accountTitle}</CardTitle>
                            <CardDescription className="text-sm leading-6 text-mutedForeground">
                              {preview.privacy.accountDescription}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="grid gap-3 sm:grid-cols-2">
                            {preview.privacy.accountFacts.map((fact) => (
                              <div
                                key={fact.label}
                                className="rounded-[22px] border border-border/70 bg-background/85 p-4"
                              >
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
                                  {fact.label}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                  {fact.value}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-mutedForeground">
                                  {fact.detail}
                                </p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="border border-border/70 bg-surface shadow-none">
                          <CardHeader className="space-y-2">
                            <CardTitle className="text-xl">
                              {preview.privacy.integrationsTitle}
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-mutedForeground">
                              {preview.privacy.integrationsDescription}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            {preview.privacy.integrations.map((integration) => {
                              const tone = integrationToneMap[integration.tone];

                              return (
                                <div
                                  key={integration.label}
                                  className={cn(
                                    "rounded-[24px] border p-4 transition-colors",
                                    tone.container
                                  )}
                                >
                                  <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="space-y-1">
                                        <p className="text-sm font-semibold text-foreground">
                                          {integration.label}
                                        </p>
                                        <p className="text-sm leading-6 text-mutedForeground">
                                          {integration.detail}
                                        </p>
                                      </div>

                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "rounded-full px-2.5 py-1 text-xs",
                                          tone.badge
                                        )}
                                      >
                                        {integration.status}
                                      </Badge>
                                    </div>

                                    <Button variant="surface" size="sm" disabled>
                                      {integration.actionLabel}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      </div>
                    ) : null}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24">
            <Card className="border border-border/70 bg-surface shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{preview.sidebar.blendTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-mutedForeground">
                  {preview.sidebar.blendDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {blendItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-border/70 bg-background/85 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-surface shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{preview.sidebar.principlesTitle}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {preview.sidebar.principles.map((principle) => (
                  <div key={principle} className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm leading-6 text-mutedForeground">{principle}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-surface shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{preview.sidebar.roadmapTitle}</CardTitle>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[21rem] pr-4">
                  <div className="space-y-3">
                    {preview.sidebar.roadmapItems.map((item) => {
                      const tone = roadmapToneMap[item.tone];

                      return (
                        <div
                          key={item.label}
                          className={cn("rounded-[22px] border p-4", tone.container)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{item.label}</p>
                              <p className="text-sm leading-6 text-mutedForeground">
                                {item.detail}
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className={cn("rounded-full px-2.5 py-1 text-xs", tone.badge)}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
