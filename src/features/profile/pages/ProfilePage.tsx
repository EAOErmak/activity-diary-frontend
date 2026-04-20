import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  Clock3,
  Compass,
  Flame,
  LineChart,
  Link2,
  NotebookPen,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { useProfile } from "../hooks/useProfile";
import {
  buildProfilePagePreview,
  type ProfileConnection,
  type ProfileHighlight,
  type ProfilePageLocale,
  type ProfileSnapshotStat,
} from "./profilePagePreview";

const snapshotIcons: LucideIcon[] = [Flame, NotebookPen, Target, LineChart];

const highlightIconMap: Record<ProfileHighlight["kind"], LucideIcon> = {
  reflection: NotebookPen,
  goal: Target,
  streak: Flame,
  signal: LineChart,
};

const connectionToneMap: Record<
  ProfileConnection["state"],
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
    container: "border-border/70 bg-surfaceMuted/40",
    badge: "border-border/70 bg-surface text-mutedForeground",
  },
};

function getInitials(name: string, handle: string) {
  const normalizedName = name.trim();

  if (normalizedName.length > 0) {
    const parts = normalizedName.split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    if (initials) {
      return initials;
    }
  }

  return handle.replace("@", "").slice(0, 2).toUpperCase() || "AD";
}

function getRoleBadgeVariant(role?: "USER" | "PREMIUM" | "ADMIN") {
  if (role === "ADMIN") {
    return "destructive" as const;
  }

  if (role === "PREMIUM") {
    return "default" as const;
  }

  return "secondary" as const;
}

function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-5 w-full max-w-3xl" />
        </div>

        <Card className="border border-border/70 bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
            <div className="space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-7 w-24 rounded-full" />
                      <Skeleton className="h-7 w-28 rounded-full" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-12 w-36 rounded-full" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-6 w-full max-w-xl" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-36 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-border/70 bg-background/85 p-4"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-6 w-36" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border border-border/70 bg-surface shadow-none">
              <CardContent className="space-y-4 p-5">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(340px,0.95fr)] xl:items-start">
          <Card className="border border-border/70 bg-surface shadow-none xl:col-span-2">
            <CardHeader className="space-y-4">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full rounded-[24px]" />
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-surface shadow-none xl:order-4">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full rounded-[24px]" />
              <Skeleton className="h-20 w-full rounded-[24px]" />
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-surface shadow-none xl:order-5">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full rounded-[24px]" />
              <Skeleton className="h-20 w-full rounded-[24px]" />
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-surface shadow-none xl:order-3 xl:row-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full rounded-[22px]" />
              <Skeleton className="h-16 w-full rounded-[22px]" />
              <Skeleton className="h-36 w-full rounded-[22px]" />
              <Skeleton className="h-24 w-full rounded-[22px]" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SnapshotCard({
  icon: Icon,
  stat,
}: {
  icon: LucideIcon;
  stat: ProfileSnapshotStat;
}) {
  return (
    <Card className="border border-border/70 bg-surface shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surfaceMuted/80 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
            {stat.label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
        </div>

        <p className="text-sm leading-6 text-mutedForeground">{stat.detail}</p>
      </CardContent>
    </Card>
  );
}

function HighlightTimelineItem({ highlight }: { highlight: ProfileHighlight }) {
  const Icon = highlightIconMap[highlight.kind];

  return (
    <div className="rounded-[24px] border border-border/70 bg-background/85 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-border/70 bg-surface px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-mutedForeground"
            >
              {highlight.label}
            </Badge>
            <span className="text-xs text-mutedForeground">{highlight.meta}</span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{highlight.title}</p>
            <p className="text-sm leading-6 text-mutedForeground">{highlight.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useProfile();
  const navigate = useNavigate();

  const locale: ProfilePageLocale =
    i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "en";
  const roleLabels = {
    USER: t("profile.roles.user"),
    PREMIUM: t("profile.roles.premium"),
    ADMIN: t("profile.roles.admin"),
  } as const;

  if (loading && !user) {
    return <ProfilePageSkeleton />;
  }

  const roleLabel = user ? roleLabels[user.role] ?? user.role : undefined;
  const statusLabel = user
    ? user.enabled
      ? t("profile.active")
      : t("profile.disabled")
    : undefined;
  const preview = buildProfilePagePreview({
    locale,
    user,
    roleLabel,
    statusLabel,
  });
  const initials = getInitials(preview.hero.name, preview.hero.handle);
  const roleVariant = getRoleBadgeVariant(user?.role);
  const editDisabled = !user;

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="inline-flex w-fit rounded-full border-border/70 bg-surface/80 px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-mutedForeground"
          >
            {preview.header.badge}
          </Badge>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("profile.title")}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-mutedForeground sm:text-base">
                {preview.header.description}
              </p>
            </div>

            {!user ? (
              <div className="rounded-[24px] border border-border/70 bg-surface/80 px-4 py-3 text-sm text-mutedForeground shadow-sm lg:max-w-sm">
                {preview.header.identityHint}
              </div>
            ) : null}
          </div>
        </div>

        <Card className="overflow-hidden border border-border/70 bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div
            className="relative"
            style={{
              background:
                "radial-gradient(circle at top left, hsl(var(--primary) / 0.16), transparent 38%), radial-gradient(circle at bottom right, hsl(var(--primary) / 0.08), transparent 32%)",
            }}
          >
            <CardContent className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
              <div className="space-y-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <Avatar className="h-20 w-20 border border-border/70 shadow-sm">
                      <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-4">
                      <div className="space-y-1">
                        <div className="text-3xl font-semibold tracking-tight text-foreground">
                          {preview.hero.name}
                        </div>
                        <div className="text-sm text-mutedForeground">{preview.hero.handle}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={roleVariant}
                          className="rounded-full px-3 py-1 text-xs"
                        >
                          {roleLabel ?? preview.hero.fallbackRole}
                        </Badge>
                        <Badge
                          variant={user?.enabled === false ? "destructive" : "outline"}
                          className="rounded-full border-border/70 bg-surface/80 px-3 py-1 text-xs"
                        >
                          {statusLabel ?? preview.hero.fallbackStatus}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/70 bg-surface/80 px-3 py-1 text-xs text-mutedForeground"
                        >
                          {preview.hero.memberSince}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="shrink-0"
                    disabled={editDisabled}
                    onClick={() => navigate("/profile/edit")}
                  >
                    {t("profile.editButton")}
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="max-w-2xl text-lg font-medium leading-relaxed text-foreground">
                    {preview.hero.tagline}
                  </p>
                  <p className="max-w-2xl text-sm leading-7 text-mutedForeground">
                    {preview.hero.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {preview.hero.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-xs text-mutedForeground"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                {preview.hero.insightCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
                      {item.label}
                    </p>
                    <p className="mt-4 text-lg font-semibold text-foreground">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-mutedForeground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {preview.snapshotStats.map((stat, index) => (
            <SnapshotCard
              key={stat.label}
              icon={snapshotIcons[index] ?? Sparkles}
              stat={stat}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(340px,0.95fr)] xl:items-start">
          <Card className="border border-border/70 bg-surface shadow-none xl:col-span-2">
            <CardHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surfaceMuted/80 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{preview.behavior.title}</CardTitle>
                  <CardDescription className="max-w-2xl text-sm leading-6 text-mutedForeground">
                    {preview.behavior.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <Tabs defaultValue="rhythm" className="space-y-5">
                <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-[22px] bg-surfaceMuted/70 p-2 md:grid-cols-3">
                  <TabsTrigger
                    value="rhythm"
                    className="flex min-h-[64px] justify-start gap-2 whitespace-normal rounded-[18px] px-4 py-3 text-left text-sm"
                  >
                    <Clock3 className="h-4 w-4" />
                    {preview.behavior.tabs.rhythm}
                  </TabsTrigger>
                  <TabsTrigger
                    value="focus"
                    className="flex min-h-[64px] justify-start gap-2 whitespace-normal rounded-[18px] px-4 py-3 text-left text-sm"
                  >
                    <Compass className="h-4 w-4" />
                    {preview.behavior.tabs.focus}
                  </TabsTrigger>
                  <TabsTrigger
                    value="highlights"
                    className="flex min-h-[64px] justify-start gap-2 whitespace-normal rounded-[18px] px-4 py-3 text-left text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    {preview.behavior.tabs.highlights}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rhythm" className="m-0">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                    <section className="rounded-[24px] border border-border/70 bg-surfaceMuted/60 p-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.rhythmTitle}
                        </h3>
                        <p className="text-sm leading-6 text-mutedForeground">
                          {preview.behavior.rhythmDescription}
                        </p>
                      </div>

                      <div className="mt-6 overflow-x-auto pb-2">
                        <div className="flex min-w-[32rem] items-end gap-3">
                          {preview.behavior.rhythmDays.map((day) => (
                            <div key={day.label} className="flex flex-1 flex-col items-center gap-3">
                              <div className="flex h-36 w-full items-end rounded-[20px] border border-border/70 bg-background/80 p-2">
                                <div
                                  className="w-full rounded-[14px] bg-primary/90"
                                  style={{ height: `${Math.max(day.score, 12)}%` }}
                                />
                              </div>
                              <div className="space-y-1 text-center">
                                <div className="text-sm font-medium text-foreground">{day.label}</div>
                                <div className="text-xs text-mutedForeground">{day.score}%</div>
                                <div className="text-[11px] text-mutedForeground">{day.note}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <div className="space-y-4">
                      <section className="rounded-[24px] border border-border/70 bg-background/85 p-4">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.anchorTitle}
                        </h3>
                        <div className="mt-4 space-y-3">
                          {preview.behavior.anchorWindows.map((window) => (
                            <div
                              key={window.label}
                              className="rounded-[18px] border border-border/70 bg-surface px-4 py-3"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground">
                                    {window.label}
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-mutedForeground">
                                    {window.detail}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="shrink-0 rounded-full border-border/70 bg-background px-2.5 py-1 text-xs text-mutedForeground"
                                >
                                  {window.time}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[24px] border border-border/70 bg-background/85 p-4">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.rhythmNotesTitle}
                        </h3>
                        <div className="mt-4 space-y-3">
                          {preview.behavior.rhythmNotes.map((note) => (
                            <div key={note} className="flex items-start gap-3">
                              <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                              <p className="text-sm leading-6 text-mutedForeground">{note}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="focus" className="m-0">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                    <section className="space-y-3 rounded-[24px] border border-border/70 bg-surfaceMuted/50 p-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.focusTitle}
                        </h3>
                        <p className="text-sm leading-6 text-mutedForeground">
                          {preview.behavior.focusDescription}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {preview.behavior.focusAreas.map((area) => (
                          <div
                            key={area.label}
                            className="rounded-[20px] border border-border/70 bg-background/85 p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                  {area.label}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-mutedForeground">
                                  {area.detail}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="shrink-0 rounded-full border-border/70 bg-surface px-2.5 py-1 text-xs text-mutedForeground"
                              >
                                {area.trend}
                              </Badge>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between gap-3 text-xs text-mutedForeground">
                                <span className="min-w-0">{area.label}</span>
                                <span className="shrink-0">{area.share}%</span>
                              </div>
                              <Progress value={area.share} className="h-2.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4 rounded-[24px] border border-border/70 bg-background/85 p-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.trackingPaletteTitle}
                        </h3>
                        <p className="text-sm leading-6 text-mutedForeground">
                          {preview.behavior.trackingPaletteDescription}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {preview.behavior.trackingPalette.map((item) => (
                          <Badge
                            key={item}
                            variant="outline"
                            className="rounded-full border-border/70 bg-surface px-3 py-1 text-xs text-mutedForeground"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>

                      <Separator />

                      <div className="rounded-[20px] border border-primary/15 bg-primary/5 p-4">
                        <p className="text-sm leading-6 text-foreground">
                          {preview.behavior.focusNote}
                        </p>
                      </div>
                    </section>
                  </div>
                </TabsContent>

                <TabsContent value="highlights" className="m-0">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                    <section className="rounded-[24px] border border-border/70 bg-surfaceMuted/50 p-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.highlightsTitle}
                        </h3>
                        <p className="text-sm leading-6 text-mutedForeground">
                          {preview.behavior.highlightsDescription}
                        </p>
                      </div>

                      <ScrollArea className="mt-4 h-[24rem] pr-4 sm:h-[27rem]">
                        <div className="space-y-3">
                          {preview.behavior.highlights.map((highlight) => (
                            <HighlightTimelineItem
                              key={`${highlight.label}-${highlight.title}`}
                              highlight={highlight}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </section>

                    <div className="space-y-4">
                      <section className="rounded-[24px] border border-border/70 bg-background/85 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                            <Sparkles className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-base font-semibold text-foreground">
                              {preview.behavior.reflectionCueTitle}
                            </h3>
                            <p className="text-sm leading-6 text-mutedForeground">
                              {preview.behavior.reflectionCueText}
                            </p>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[24px] border border-border/70 bg-background/85 p-4">
                        <h3 className="text-base font-semibold text-foreground">
                          {preview.behavior.watchListTitle}
                        </h3>
                        <div className="mt-4 space-y-3">
                          {preview.behavior.watchList.map((item) => (
                            <div key={item} className="flex items-start gap-3">
                              <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                              <p className="text-sm leading-6 text-mutedForeground">{item}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-surface shadow-none xl:order-4">
            <CardHeader className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surfaceMuted/80 text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{preview.goals.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-mutedForeground">
                    {preview.goals.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {preview.goals.items.map((goal) => (
                <div
                  key={goal.label}
                  className="rounded-[24px] border border-border/70 bg-surfaceMuted/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between xl:flex-col 2xl:flex-row">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground">{goal.label}</p>
                      <p className="text-sm leading-6 text-mutedForeground">{goal.detail}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 self-start rounded-full border-border/70 bg-background px-2.5 py-1 text-xs text-mutedForeground"
                    >
                      {goal.streak}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3 text-xs text-mutedForeground">
                      <span className="min-w-0">{goal.cadence}</span>
                      <span className="shrink-0">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-surface shadow-none xl:order-5">
            <CardHeader className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surfaceMuted/80 text-primary">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{preview.milestones.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-mutedForeground">
                    {preview.milestones.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {preview.milestones.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-border/70 bg-surfaceMuted/35 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-mutedForeground">{item.detail}</p>
                </div>
              ))}

              <div className="rounded-[24px] border border-primary/15 bg-primary/5 p-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
                    {preview.milestones.nextMilestoneLabel}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {preview.milestones.nextMilestoneValue}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={preview.milestones.nextMilestoneProgress} className="h-2.5" />
                  <p className="text-xs text-mutedForeground">
                    {preview.milestones.nextMilestoneDetail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-surface shadow-none xl:order-3 xl:row-span-2">
            <CardHeader className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-surfaceMuted/80 text-primary">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{preview.setup.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-mutedForeground">
                    {preview.setup.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-3">
                {preview.setup.preferences.map((preference) => (
                  <div
                    key={preference.label}
                    className="flex flex-col gap-4 rounded-[22px] border border-border/70 bg-surfaceMuted/35 p-4 md:flex-row md:items-start md:justify-between xl:flex-col 2xl:flex-row"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {preference.label}
                      </p>
                      <p className="text-sm leading-6 text-mutedForeground">
                        {preference.detail}
                      </p>
                    </div>
                    <Switch
                      checked={preference.enabled}
                      disabled
                      aria-label={preference.label}
                      className="self-start"
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    {preview.setup.privacyTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {preview.setup.privacyFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-[22px] border border-border/70 bg-background/85 p-4"
                    >
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-mutedForeground">
                        {fact.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{fact.value}</p>
                      <p className="mt-2 text-sm leading-6 text-mutedForeground">{fact.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4.5 w-4.5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    {preview.setup.connectionsTitle}
                  </h3>
                </div>

                <div className="space-y-3">
                  {preview.setup.connections.map((connection) => {
                    const tone = connectionToneMap[connection.state];

                    return (
                      <div
                        key={connection.label}
                        className={cn("rounded-[22px] border p-4 transition-colors", tone.container)}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between xl:flex-col 2xl:flex-row">
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              {connection.label}
                            </p>
                            <p className="text-sm leading-6 text-mutedForeground">
                              {connection.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("shrink-0 self-start rounded-full px-2.5 py-1 text-xs", tone.badge)}
                          >
                            {connection.stateLabel}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
