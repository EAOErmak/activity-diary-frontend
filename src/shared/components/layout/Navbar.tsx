import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTheme } from "@/theme-provider";
import { Menu } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/sheet";

import UserNavigation from "@/shared/components/navigation/UserNavigation";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-border bg-surface">
      <div className="w-full flex items-center justify-between px-5 py-2">

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="left"
            className="w-[90vw] sm:w-80 p-0 bg-surface text-surfaceForeground border-r border-border [&>button]:hidden"
          >
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

        </div>
      </div>
    </header>
  );
}


