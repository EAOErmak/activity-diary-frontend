import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-3 flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors">
        Activity<span className="text-blue-500">Diary</span>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {!user ? (
          <>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Войти
            </Button>
            <Button onClick={() => navigate("/register")}>Регистрация</Button>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8 border border-gray-700">
                  <AvatarImage src={user?.avatarUrl || ""} />
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-200">{user.email}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Настройки
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-400">
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
