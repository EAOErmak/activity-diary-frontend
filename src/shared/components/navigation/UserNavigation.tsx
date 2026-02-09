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
  Settings,
  ShieldCheck,
  UserCircle2,
  LogOut,
} from "lucide-react";

import userImg from "@/assets/AD_white.svg";
import adminImg from "@/assets/ADP_white.svg";
import { useAuthStore } from "@/shared/store/authStore";

type Props = {
  onNavigate?: () => void;
};

export default function UserNavigation({ onNavigate }: Props) {
  const { role, username, isAuthenticated, logout } = useAuthStore();
  const nav = useNavigate();
  const headerImage = role === "ADMIN" ? adminImg : userImg;
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
      <SheetHeader className="relative overflow-visible px-5 pb-5 pt-6">
        <div className="absolute inset-0 bg-gradient-to-br from-surfaceMuted via-surface to-surface" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <img
              src={headerImage}
              className="h-14 w-14 rounded-xl object-contain shrink-0 ring-2 ring-border/60 p-1 bg-surface"
              alt="Avatar"
            />
            <div className="min-w-0">
              <SheetTitle className="text-xl">Навигация</SheetTitle>
              <div className="mt-1 text-sm text-mutedForeground truncate">
                {username || "Гость"}
              </div>
            </div>
          </div>
          <SheetDescription className="mt-3 text-sm text-mutedForeground">
            Быстрый доступ к разделам
          </SheetDescription>
        </div>
      </SheetHeader>

      {/* LINKS */}
      <nav className="flex flex-col gap-1 px-3 pb-5">
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
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-base transition-colors text-event-loseText hover:bg-surfaceMuted"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Выйти
            </button>
          </>
        )}
      </nav>
    </div>
  );
}








