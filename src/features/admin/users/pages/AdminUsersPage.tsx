import { useEffect, useMemo, useState } from "react";
import {
  getAllUsers,
  updateUserRole,
  toggleUserEnabled,
  toggleUserLocked,
} from "@/api/admin/adminUsersApi";
import type { AdminUserDto } from "@/shared/types/adminUser";
import { useAuthStore } from "@/shared/store/authStore";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";

type RoleFilter = "ALL" | "ADMIN" | "USER" | "PREMIUM";
type StatusFilter = "ALL" | "ENABLED" | "DISABLED" | "LOCKED";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { userId: currentUserId } = useAuthStore();

  const ROLES: Array<AdminUserDto["role"]> = [
  "USER",
  "PREMIUM",
  "ADMIN",
];


  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(
    user: AdminUserDto,
    nextRole: AdminUserDto["role"]
  ) {
    if (user.id === currentUserId) {
      alert("Нельзя изменить роль самому себе.");
      return;
    }

    if (user.role === nextRole) return;

    const ok = confirm(
      `Вы уверены, что хотите назначить роль "${nextRole}" пользователю "${user.username}"?`
    );
    if (!ok) return;

    await updateUserRole(user.id, { role: nextRole });
    load();
  }


  async function handleEnabled(user: AdminUserDto) {
    if (user.id === currentUserId) {
      alert("Нельзя отключить самого себя.");
      return;
    }

    const actionText = user.enabled ? "выключить" : "включить";

    const ok = confirm(
      `Вы уверены, что хотите ${actionText} пользователя "${user.username}"?`
    );
    if (!ok) return;

    await toggleUserEnabled(user.id, !user.enabled);
    load();
  }

  async function handleLock(user: AdminUserDto) {
    if (user.id === currentUserId) {
      alert("Нельзя заблокировать самого себя.");
      return;
    }

    const actionText = user.accountLocked ? "разблокировать" : "заблокировать";

    const ok = confirm(
      `Вы уверены, что хотите ${actionText} пользователя "${user.username}"?`
    );
    if (!ok) return;

    await toggleUserLocked(user.id, !user.accountLocked);
    load();
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ENABLED" && u.enabled) ||
        (statusFilter === "DISABLED" && !u.enabled) ||
        (statusFilter === "LOCKED" && u.accountLocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  if (loading) {
    return <p className="p-6 text-white">Загрузка...</p>;
  }

  return (
    <div className="p-8 text-white">
      {/* ЗАГОЛОВОК */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="text-slate-400 text-sm mt-1">
          Управление аккаунтами, ролями и доступом
        </p>
      </div>

      <Button
        onClick={() => navigate("/admin/users/create")}
      >
        + Создать пользователя
      </Button>

      {/* ФИЛЬТРЫ */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по username или имени..."
          className="px-3 py-2 rounded bg-slate-800 border border-slate-700 outline-none"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="ALL">Все роли</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="ALL">Все статусы</option>
          <option value="ENABLED">Активные</option>
          <option value="DISABLED">Выключенные</option>
          <option value="LOCKED">Заблокированные</option>
        </select>

        <div className="ml-auto text-sm text-slate-400 self-center">
          Найдено: {filteredUsers.length}
        </div>
      </div>

      {/* ТАБЛИЦА */}
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Имя</th>
              <th className="p-2 text-left">Роль</th>
              <th className="p-2 text-center">Активен</th>
              <th className="p-2 text-center">Заблокирован</th>
              <th className="p-2 text-left">Создан</th>
              <th className="p-2 text-left">Действия</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => {
              const isSelf = u.id === currentUserId;

              return (
                <tr key={u.id} className="border-t border-slate-700">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.fullName}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) =>
                        handleRoleChange(u, e.target.value as AdminUserDto["role"])
                      }
                      className={`px-2 py-1 rounded border bg-slate-800 border-slate-700 ${
                        isSelf ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    {u.enabled ? "✅" : "❌"}
                  </td>
                  <td className="p-2 text-center">
                    {u.accountLocked ? "🔒" : "🔓"}
                  </td>
                  <td className="p-2">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEnabled(u)}
                      disabled={isSelf}
                      className={`px-2 py-1 rounded ${
                        isSelf
                          ? "bg-slate-600 cursor-not-allowed"
                          : u.enabled
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {u.enabled ? "Выключить" : "Включить"}
                    </button>

                    <button
                      onClick={() => handleLock(u)}
                      disabled={isSelf}
                      className={`px-2 py-1 rounded ${
                        isSelf
                          ? "bg-slate-600 cursor-not-allowed"
                          : u.accountLocked
                          ? "bg-green-700 hover:bg-green-800"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {u.accountLocked ? "Разблокировать" : "Заблокировать"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-slate-400"
                >
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
