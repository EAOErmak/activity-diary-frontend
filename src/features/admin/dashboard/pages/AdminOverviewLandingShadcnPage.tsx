import {
  ArrowRight,
  BookOpen,
  Database,
  Link2,
  Tags,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function AdminOverviewLandingShadcnPage() {
  const { t } = useTranslation();
  const sections = [
    {
      to: "/admin/users",
      title: t("admin.users"),
      description: t("admin.usersPage.subtitle"),
      icon: Users,
    },
    {
      to: "/admin/dictionary",
      title: t("admin.dictionaries"),
      description: t("admin.dictionaryPage.subtitle"),
      icon: BookOpen,
    },
    {
      to: "/admin/foods",
      title: t("admin.foods"),
      description: t("admin.foodsPage.subtitle"),
      icon: UtensilsCrossed,
    },
    {
      to: "/admin/metric-links",
      title: t("admin.metricLinks"),
      description: t("admin.metricLinksPage.subtitle"),
      icon: Link2,
    },
    {
      to: "/admin/tags",
      title: t("admin.tags"),
      description: t("admin.tagsPage.subtitle"),
      icon: Tags,
    },
    {
      to: "/admin/database",
      title: t("admin.database"),
      description: t("admin.databasePage.subtitle"),
      icon: Database,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-transparent px-3 py-1"
        >
          {t("admin.overviewPage.badge")}
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("admin.overviewPage.title")}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("admin.overviewPage.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link key={section.to} to={section.to} className="block">
              <Card className="h-full bg-surface transition-colors hover:bg-accent/30">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
