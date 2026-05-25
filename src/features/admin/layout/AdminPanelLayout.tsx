import {
  ArrowLeft,
  BookOpen,
  Link2,
  Moon,
  Shield,
  Sun,
  Tags,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { LanguageToggle } from "@/language-toggle";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/theme-provider";

export default function AdminPanelLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    {
      to: "/admin/dictionary",
      label: t("admin.dictionaries"),
      icon: BookOpen,
    },
    {
      to: "/admin/metric-links",
      label: t("admin.metricLinks"),
      icon: Link2,
    },
    {
      to: "/admin/tags",
      label: t("admin.tags"),
      icon: Tags,
    },
  ] as const;

  function isActivePath(path: string) {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0">
          <div className="flex h-full flex-col p-4 sm:p-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/60">
                    {t("admin.panelBadge")}
                  </p>
                  <h1 className="truncate text-lg font-semibold">
                    {t("admin.panelTitle")}
                  </h1>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.to);

                return (
                  <Button
                    key={item.to}
                    asChild
                    variant="ghost"
                    className={cn(
                      "h-12 justify-start rounded-2xl px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <NavLink to={item.to}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </Button>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4 pt-6">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-3xl bg-background/90 p-2 shadow-sm">
                <LanguageToggle />
                <Button
                  variant="surface"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-10 w-10 shrink-0 rounded-2xl"
                  aria-label={t("toggles.theme")}
                  title={t("toggles.theme")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start rounded-2xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => navigate("/diary", { replace: true })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("admin.backToDiary")}
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-page">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
