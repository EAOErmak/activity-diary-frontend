import { NavLink } from "react-router-dom";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";

import userImg from "@/assets/AD_white.svg";
import adminImg from "@/assets/ADP_white.svg";
import { useAuthStore } from "@/shared/store/authStore";

type Props = {
  onNavigate?: () => void;
};

export default function UserNavigation({ onNavigate }: Props) {
  const { role, username } = useAuthStore();
  const headerImage = role === "ADMIN" ? adminImg : userImg;
  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <SheetHeader className="px-4 py-4 overflow-visible">
            <div className="flex items-center gap-3">
                <img
                src={headerImage}
                className="h-12 w-12 rounded-full object-cover shrink-0"
                />
            </div>
        <SheetTitle>Навигация</SheetTitle>
        <SheetDescription>
          Быстрый доступ к разделам
        </SheetDescription>
      </SheetHeader>

      {/* LINKS */}
      <nav className="flex flex-col gap-2 p-4">
        <NavLink to="/diary" onClick={onNavigate}>
          Дневник
        </NavLink>

        <NavLink to="/calendar" onClick={onNavigate}>
          Календарь
        </NavLink>

        <NavLink to="/dashboard" onClick={onNavigate}>
          Аналитика
        </NavLink>

        <NavLink to="/settings" onClick={onNavigate}>
          Настройки
        </NavLink>
      </nav>
    </div>
  );
}
