import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, User, LogOut, Shield } from "lucide-react";
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
import { useTheme } from "@/theme-provider";
import { Menu } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/sheet";

import UserNavigation from "@/shared/components/navigation/UserNavigation";

export default function Navbar() {
  const { username, isAuthenticated, logout, role } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface">
      <div className="w-full flex items-center justify-between px-6 py-3">

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-[90vw] sm:w-80 p-4 [&>button]:hidden">
            <UserNavigation onNavigate={() => setMenuOpen(false)} />
          </SheetContent>            
        </Sheet>

        {/* LOGO */}
        <Link
          to="/"
          className="text-xl font-bold text-surfaceForeground"
        >
          Activity
          <span className="text-primary">Diary</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* THEME TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-surfaceMuted"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  rounded-full p-2
                  text-mutedForeground
                  hover:bg-surfaceMuted
                "
              >
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52 bg-surface text-surfaceForeground border border-border">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel className="font-semibold">
                    {username}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
               
                  <DropdownMenuItem onClick={() => nav("/settings")}>
                    Настройки
                  </DropdownMenuItem>        

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      nav("/", { replace: true });
                    }}
                    className="text-event-loseText"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
