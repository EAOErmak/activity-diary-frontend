import React, { useContext } from "react";
import { ThemeContext } from "@/theme-provider";
import { Link, useNavigate } from "react-router-dom";
import { Moon, User, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/shared/store/authStore";

export default function Navbar() {
  const { username, isAuthenticated, logout, role } = useAuthStore();
  const nav = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header className="bg-[#0E1420] border-b border-slate-800/70 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-xl font-bold text-white">
          Activity<span className="text-blue-500">Diary</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-[#151C2C] text-yellow-400 hover:bg-[#1C2435]"
          >
            <Moon className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-[#151C2C] hover:bg-[#1C2435] p-2 rounded-full text-gray-300">
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52 bg-[#1C2435] text-gray-200 border border-slate-700/60 rounded-2xl shadow-lg mt-2">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel className="text-blue-400 font-semibold">
                    {username}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => nav("/diary")}>
                    Мои записи
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => nav("/settings")}>
                    Настройки
                  </DropdownMenuItem>

                  {role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => nav("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Админ-панель
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      nav("/", { replace: true });
                    }}
                    className="text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => nav("/login")}>
                    Войти
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/register")}>
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
