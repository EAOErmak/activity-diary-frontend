import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserRole,
  toggleUserEnabled,
  toggleUserLocked,
} from "@/api/admin/adminUsersApi";
import type { AdminUserDto } from "@/shared/types/adminUser";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }

  async function handleRoleChange(userId: number, role: "ADMIN" | "USER") {
    await updateUserRole(userId, { role });
    load();
  }

  async function handleEnabled(userId: number, enabled: boolean) {
    await toggleUserEnabled(userId, enabled);
    load();
  }

  async function handleLock(userId: number, locked: boolean) {
    await toggleUserLocked(userId, locked);
    load();
  }

  if (loading) return <p className="p-6 text-white">Загрузка...</p>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Админ — Пользователи</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Username</th>
              <th className="p-2">Имя</th>
              <th className="p-2">Роль</th>
              <th className="p-2">Активен</th>
              <th className="p-2">Заблокирован</th>
              <th className="p-2">Создан</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-700">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.fullName}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.enabled ? "✅" : "❌"}</td>
                <td className="p-2">{u.accountLocked ? "🔒" : "🔓"}</td>
                <td className="p-2">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() =>
                      handleRoleChange(
                        u.id,
                        u.role === "ADMIN" ? "USER" : "ADMIN"
                      )
                    }
                    className="px-2 py-1 bg-blue-600 rounded"
                  >
                    Роль
                  </button>

                  <button
                    onClick={() => handleEnabled(u.id, !u.enabled)}
                    className="px-2 py-1 bg-green-600 rounded"
                  >
                    Enable
                  </button>

                  <button
                    onClick={() => handleLock(u.id, !u.accountLocked)}
                    className="px-2 py-1 bg-red-600 rounded"
                  >
                    Lock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
