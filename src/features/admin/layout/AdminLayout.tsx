import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/shared/store/authStore";

export default function AdminLayout() {
  const nav = useNavigate();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-[#0E1420] text-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#151C2C] border-r border-slate-800 p-4 flex flex-col gap-3">
        <Button variant="ghost" onClick={() => nav("/admin")}>
          Обзор
        </Button>
        <Button variant="ghost" onClick={() => nav("/admin/users")}>
          Пользователи
        </Button>
        <Button variant="ghost" onClick={() => nav("/admin/dictionary")}>
          Словари
        </Button>
        <Button variant="ghost" onClick={() => nav("/admin/entry-config")}>
          Конфигурация
        </Button>

        <div className="mt-auto">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              nav("/diary", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Вернуться к дневнику
          </Button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
