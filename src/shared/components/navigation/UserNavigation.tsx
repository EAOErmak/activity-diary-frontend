import { NavLink, useNavigate } from "react-router-dom";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import {
  Calendar,
  LayoutDashboard,
  NotebookPen,
  Layers,
  Target,
  Settings,
  ShieldCheck,
  UserCircle2,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";

import userImgBlack from "@/assets/AD_black.svg";
import userImgWhite from "@/assets/AD_white.svg";
import adminImgBlack from "@/assets/ADP_black.svg";
import adminImgWhite from "@/assets/ADP_white.svg";
import { useAuthStore } from "@/shared/store/authStore";
import { useTheme } from "@/theme-provider";

type Props = {
  onNavigate?: () => void;
};

export default function UserNavigation({ onNavigate }: Props) {
  const { role, isAuthenticated, logout } = useAuthStore();
  const { theme } = useTheme();
  const nav = useNavigate();
  const headerImage =
    role === "ADMIN"
      ? theme === "dark"
        ? adminImgWhite
        : adminImgBlack
      : theme === "dark"
      ? userImgWhite
      : userImgBlack;
  const isPremium = role === "PREMIUM" || role === "ADMIN";

  const navItems = [
    {
      to: "/diary",
      label: "Дневник",
      icon: NotebookPen,
      show: true,
    },
    {
      to: "/calendar",
      label: "Календарь",
      icon: Calendar,
      show: true,
    },
    {
      to: "/entry-templates",
      label: "Шаблоны",
      icon: Layers,
      show: true,
    },
    {
      to: "/food",
      label: "Еда",
      icon: UtensilsCrossed,
      show: true,
    },
    {
      to: "/goals",
      label: "Цели",
      icon: Target,
      show: true,
    },
    {
      to: "/settings",
      label: "Настройки",
      icon: Settings,
      show: true,
    },
    {
      to: "/profile",
      label: "Профиль",
      icon: UserCircle2,
      show: true,
    },
    {
      to: "/dashboard",
      label: "Аналитика",
      icon: LayoutDashboard,
      show: isPremium,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <SheetHeader className="relative overflow-visible px-5 pb-5 pt-1">
        <div className="absolute inset-0 bg-gradient-to-br from-surfaceMuted via-surface to-surface" />
        <div className="relative space-y-3.5">
          <SheetTitle className="sr-only">Навигация</SheetTitle>
          <div className="relative -translate-y-2 mb-[-0.75rem] w-fit rounded-[1.75rem] border border-border/70 bg-surface/90 p-3 shadow-sm backdrop-blur-sm">
            <img
              src={headerImage}
              className="h-20 w-auto max-w-[15rem] object-contain"
              alt="Логотип Activity Diary"
            />
          </div>
          <div className="space-y-2">
            <div className="h-px bg-border/70" aria-hidden="true" />
            <SheetDescription className="text-left text-[0.72rem] font-medium uppercase tracking-[0.24em] text-mutedForeground/90">
              Быстрый доступ к разделам
            </SheetDescription>
            <div className="h-px bg-border/70" aria-hidden="true" />
          </div>
        </div>
      </SheetHeader>

      {/* LINKS */}
      <nav className="flex-1 px-3">
        <div className="flex flex-col gap-1">
        {navItems
          .filter((i) => i.show)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base transition-colors",
                    "hover:bg-surfaceMuted hover:text-surfaceForeground",
                    isActive
                      ? "bg-surfaceMuted text-surfaceForeground shadow-sm"
                      : "text-mutedForeground",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

        {isPremium && <div className="my-2 h-px bg-border/70" />}
    
        {/* ===== ADMIN ===== */}
        {role === "ADMIN" && (
          <>
            <NavLink
              to="/admin"
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base transition-colors",
                  "hover:bg-surfaceMuted hover:text-surfaceForeground",
                  isActive
                    ? "bg-surfaceMuted text-surfaceForeground shadow-sm"
                    : "text-mutedForeground",
                ].join(" ")
              }
            >
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              Админ-панель
            </NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            <div className="my-2 h-px bg-border/70" />
            <button
              type="button"
              onClick={() => {
                logout();
                nav("/", { replace: true });
                onNavigate?.();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-base transition-colors text-event-loseText hover:bg-surfaceMuted"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Выйти
            </button>
          </>
        )}
        </div>
      </nav>

      <div className="mt-auto px-3 pb-5">
        <div className="mb-2 h-px bg-border/70" />
      </div>
    </div>
  );
}
