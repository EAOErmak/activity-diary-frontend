import {
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
  Link2,
  Moon,
  Shield,
  Sun,
  Tags,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/theme-provider";

const NAV_ITEMS = [
  {
    to: "/admin",
    label: "Обзор",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/users",
    label: "Пользователи",
    icon: Users,
  },
  {
    to: "/admin/dictionary",
    label: "Словари",
    icon: BookOpen,
  },
  {
    to: "/admin/foods",
    label: "Еда",
    icon: UtensilsCrossed,
  },
  {
    to: "/admin/metric-links",
    label: "Metric Links",
    icon: Link2,
  },
  {
    to: "/admin/tags",
    label: "Теги",
    icon: Tags,
  },
] as const;

export default function AdminPanelLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  function isActivePath(path: string) {
    if (path === "/admin") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex h-full flex-col p-4 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/60">
                    Admin
                  </p>
                  <h1 className="truncate text-lg font-semibold">
                    Control Panel
                  </h1>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="shrink-0 rounded-2xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>

            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
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
              <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
                <p className="text-sm font-medium">Тема админки</p>
                <p className="mt-1 text-xs text-sidebar-foreground/70">
                  Использует те же CSS-токены и переключатель темы, что и
                  остальная часть сайта.
                </p>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start rounded-2xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => navigate("/diary", { replace: true })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к дневнику
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
