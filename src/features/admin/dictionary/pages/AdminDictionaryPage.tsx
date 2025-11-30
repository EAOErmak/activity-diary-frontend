import { useEffect, useState } from "react";
import {
  getDictionaryByTypeAdmin,
  createDictionaryItem,
  updateDictionaryItem,
} from "@/api/admin/dictionaryAdminApi";

import {
  ADMIN_DICTIONARY_TYPES,
  AdminDictionaryType,
} from "@/features/admin/dictionary/constants/adminDictionaries";

import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type {
  DictionaryCreateDto,
  DictionaryUpdateDto,
  DictionaryResponseDto,
} from "@/shared/types/adminDictionary";

export default function AdminDictionaryPage() {
  const [type, setType] = useState<AdminDictionaryType>("WHAT_HAPPENED");
  const [items, setItems] = useState<DictionaryResponseDto[]>([]);
  const [label, setLabel] = useState("");
  const [allowedRole, setAllowedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD
  // ============================

  useEffect(() => {
    load();
  }, [type]);

  async function load() {
    const data = await getDictionaryByTypeAdmin(type);
    setItems(data);
  }

  // ============================
  // CREATE
  // ============================

  async function handleCreate() {
    if (!label.trim()) {
      alert("Введите название");
      return;
    }

    const dto: DictionaryCreateDto = {
      type,
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
  // TOGGLE ACTIVE
  // ============================

  async function handleToggle(item: DictionaryResponseDto) {
    const dto: DictionaryUpdateDto = {
      active: !item.active,
    };

    await updateDictionaryItem(item.id, dto);
    await load();
  }

  // ============================
  // UPDATE ROLE
  // ============================

  async function handleRoleChange(item: DictionaryResponseDto, role: string | null) {
    const dto: DictionaryUpdateDto = {
      allowedRole: role,
    };

    await updateDictionaryItem(item.id, dto);
    await load();
  }

  console.log("ADMIN_DICTIONARY_TYPES =", ADMIN_DICTIONARY_TYPES);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Словари</h1>

      {/* ============================
          SELECT TYPE
      ============================ */}
      <Select value={type} defaultValue="WHAT_HAPPENED" onValueChange={(v) => setType(v as AdminDictionaryType)}>
        <SelectTrigger className="w-[300px] mb-4">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_DICTIONARY_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ============================
          CREATE
      ============================ */}
      <div className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block mb-1 text-sm">Название</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Введите текст"
            className="bg-slate-800 px-3 py-2 rounded w-[300px]"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Роль (необязательно)</label>
          <Select
            value={allowedRole ?? "ALL"}
            onValueChange={(v) => setAllowedRole(v === "ALL" ? null : v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все пользователи" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
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

      {/* ============================
          TABLE
      ============================ */}
      <table className="w-full border border-slate-700 rounded">
        <thead className="bg-slate-800">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Label</th>
            <th className="p-2">Type</th>
            <th className="p-2">Role</th>
            <th className="p-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t border-slate-700">
              <td className="p-2">{i.id}</td>
              <td className="p-2">{i.label}</td>
              <td className="p-2">{i.type}</td>
              <td className="p-2">
                <Select
                  value={i.allowedRole ?? "ALL"}
                  onValueChange={(v) =>
                    handleRoleChange(i, v === "ALL" ? null : v)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Все" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Все</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-2">
                <Switch
                  checked={i.active}
                  onCheckedChange={() => handleToggle(i)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
