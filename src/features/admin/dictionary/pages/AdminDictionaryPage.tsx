import { useEffect, useState } from "react";
import {
  getDictionaryByTypeAdmin,
  createDictionaryItem,
  updateDictionaryItem,
} from "@/api/admin/dictionaryAdminApi";

import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type {
  DictionaryCreate,
  DictionaryUpdate,
  DictionaryResponse,
} from "@/shared/types/adminDictionary";

type Tab = "METRIC_NAME" | "METRIC_UNIT";

export default function AdminDictionaryPage() {
  const [tab, setTab] = useState<Tab>("METRIC_NAME");
  const [items, setItems] = useState<DictionaryResponse[]>([]);

  const [label, setLabel] = useState("");
  const [allowedRole, setAllowedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD
  // ============================

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    try {
      const data = await getDictionaryByTypeAdmin(tab);
      setItems(data);
    } catch (e) {
      console.error(e);
      alert("Ошибка загрузки словаря");
    }
  }

  // ============================
  // CREATE
  // ============================

  async function handleCreate() {
    if (!label.trim()) return alert("Введите название");

    const dto: DictionaryCreate = {
      type: tab,
      label: label.trim(),
      allowedRole,
    };

    try {
      setLoading(true);
      await createDictionaryItem(dto);
      setLabel("");
      setAllowedRole(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // TOGGLE ACTIVE (SAFE)
  // ============================

  async function handleToggle(item: DictionaryResponse) {
    const ok = confirm(
      `Вы уверены, что хотите ${
        item.active ? "деактивировать" : "активировать"
      } элемент "${item.label}"?`
    );
    if (!ok) return;

    const dto: DictionaryUpdate = {
      active: !item.active,
    };

    await updateDictionaryItem(item.id, dto);
    await load();
  }

  // ============================
  // CHANGE ROLE (SAFE)
  // ============================

  async function handleRoleChange(
    item: DictionaryResponse,
    role: string | null
  ) {
    const ok = confirm(
      `Вы уверены, что хотите изменить доступ для "${item.label}"?`
    );
    if (!ok) return;

    const dto: DictionaryUpdate = {
      allowedRole: role,
    };

    await updateDictionaryItem(item.id, dto);
    await load();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Словари</h1>
      <p className="text-slate-400 mb-6 text-sm">
        Управление справочниками активности и единиц измерения
      </p>

      {/* ВКЛАДКИ */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "METRIC_NAME", label: "Название активности" },
          { id: "METRIC_UNIT", label: "Единицы измерения" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 py-2 rounded ${
              tab === t.id
                ? "bg-blue-600"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CREATE */}
      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div>
          <label className="block mb-1 text-sm">Название</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="bg-slate-800 px-3 py-2 rounded w-[260px]"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Доступ</label>
          <Select
            value={allowedRole ?? "ALL"}
            onValueChange={(v) => setAllowedRole(v === "ALL" ? null : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все</SelectItem>
              <SelectItem value="USER">Пользователь</SelectItem>
              <SelectItem value="ADMIN">Администратор</SelectItem>
              <SelectItem value="PREMIUM">Премиум</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 px-5 py-2 rounded"
        >
          Создать
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border border-slate-700 rounded table-fixed">
        <thead className="bg-slate-800">
          <tr>
            <th className="w-20 px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Название</th>
            <th className="w-56 px-3 py-2 text-left">Роль доступа</th>
            <th className="w-24 px-3 py-2 text-center">Активен</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t border-slate-700">
              <td className="px-3 py-2">{i.id}</td>
              <td className="px-3 py-2 truncate">{i.label}</td>
              <td>
                <Select
                  value={i.allowedRole ?? "ALL"}
                  onValueChange={(v) =>
                    handleRoleChange(i, v === "ALL" ? null : v)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Все</SelectItem>
                    <SelectItem value="USER">Пользователь</SelectItem>
                    <SelectItem value="ADMIN">Администратор</SelectItem>
                    <SelectItem value="PREMIUM">Премиум</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="inline-flex justify-center">
                  <Switch checked={i.active} onCheckedChange={() => handleToggle(i)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
