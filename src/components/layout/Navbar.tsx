import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  const handleProfileClick = () => {
    if (!user) {
      alert("Вы не авторизованы. Пожалуйста, войдите в систему.");
    }
  };

  return (
    <header className="bg-[#0E1420] border-b border-slate-800/70 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* ЛОГО */}
        <Link to="/" className="text-xl font-bold text-white">
          Activity<span className="text-blue-500">Diary</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Переключатель темы */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#151C2C] text-yellow-400 hover:bg-[#1C2435]"
          >
            <Moon className="h-5 w-5" />
          </Button>

          {/* ПРОФИЛЬ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={handleProfileClick}
                className="bg-[#151C2C] hover:bg-[#1C2435] p-2 rounded-full text-gray-300 transition"
              >
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 bg-[#1C2435] text-gray-200 border border-slate-700/60 rounded-2xl shadow-lg mt-2">
              {user ? (
                <>
                  <DropdownMenuLabel className="text-sm text-blue-400 font-semibold">
                    {user.username || user.email || "Пользователь"}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-slate-700/60" />

                  <DropdownMenuItem
                    onClick={() => nav("/profile")}
                    className="hover:bg-blue-600/30 cursor-pointer"
                  >
                    Профиль
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => nav("/diary")}
                    className="hover:bg-blue-600/30 cursor-pointer"
                  >
                    Мои записи
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-700/60" />

                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      nav("/login");
                    }}
                    className="text-red-400 hover:bg-red-600/30 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="text-gray-400 text-sm">
                    Гость
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700/60" />
                  <DropdownMenuItem
                    onClick={() => nav("/login")}
                    className="hover:bg-blue-600/30 cursor-pointer"
                  >
                    Войти
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => nav("/register")}
                    className="hover:bg-blue-600/30 cursor-pointer"
                  >
                    Регистрация
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
