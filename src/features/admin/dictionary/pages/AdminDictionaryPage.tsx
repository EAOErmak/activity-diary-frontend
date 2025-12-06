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
  DictionaryCreateDto,
  DictionaryUpdateDto,
  DictionaryResponseDto,
} from "@/shared/types/adminDictionary";

import { getAllAdminEntryConfigs } from "@/api/admin/entryFieldConfigAdminApi";
import type { EntryFieldConfigDto } from "@/shared/types/diary";

type Tab = "WHAT_HAPPENED" | "WHAT" | "ITEM_NAME" | "UNIT";

export default function AdminDictionaryPage() {
  const [tab, setTab] = useState<Tab>("WHAT_HAPPENED");
  const [items, setItems] = useState<DictionaryResponseDto[]>([]);
  const [parents, setParents] = useState<DictionaryResponseDto[]>([]);
  const [entryConfigs, setEntryConfigs] = useState<EntryFieldConfigDto[]>([]);

  const [label, setLabel] = useState("");
  const [allowedRole, setAllowedRole] = useState<string | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [chartType, setChartType] = useState<string | null>(null);
  const [entryConfigId, setEntryConfigId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD
  // ============================

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    const data = await getDictionaryByTypeAdmin(tab);
    setItems(data);

    if (tab === "WHAT") {
      const parents = await getDictionaryByTypeAdmin("WHAT_HAPPENED");
      setParents(parents);
    } else {
      setParents([]);
      setParentId(null);
    }

    if (tab === "WHAT_HAPPENED") {
      const configs = await getAllAdminEntryConfigs();
      setEntryConfigs(configs.data.data);
    } else {
      setEntryConfigs([]);
      setEntryConfigId(null);
      setChartType(null);
    }
  }

  // ============================
  // CREATE
  // ============================

  async function handleCreate() {
    if (!label.trim()) return alert("Введите название");

    if (tab === "WHAT" && !parentId)
      return alert("Выберите родительскую категорию");

    if (tab === "WHAT_HAPPENED" && !chartType)
      return alert("Выберите тип графика");

    if (tab === "WHAT_HAPPENED" && !entryConfigId)
      return alert("Выберите конфигурацию полей");

    const dto: DictionaryCreateDto = {
      type: tab,
      label: label.trim(),
      allowedRole,
      parentId: tab === "WHAT" ? parentId! : undefined,
      chartType: tab === "WHAT_HAPPENED" ? (chartType as any) : undefined,
      entryFieldConfigId: tab === "WHAT_HAPPENED" ? entryConfigId! : undefined,
    };

    try {
      setLoading(true);
      await createDictionaryItem(dto);
      setLabel("");
      setAllowedRole(null);
      setParentId(null);
      setChartType(null);
      setEntryConfigId(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // TOGGLE ACTIVE (SAFE)
  // ============================

  async function handleToggle(item: DictionaryResponseDto) {
    const ok = confirm(
      `Вы уверены, что хотите ${
        item.active ? "деактивировать" : "активировать"
      } элемент "${item.label}"?`
    );
    if (!ok) return;

    const dto: DictionaryUpdateDto = {
      active: !item.active,
    };

    await updateDictionaryItem(item.id, dto);
    await load();
  }

  // ============================
  // CHANGE ROLE (SAFE)
  // ============================

  async function handleRoleChange(
    item: DictionaryResponseDto,
    role: string | null
  ) {
    const ok = confirm(
      `Вы уверены, что хотите изменить доступ для "${item.label}"?`
    );
    if (!ok) return;

    const dto: DictionaryUpdateDto = {
      allowedRole: role,
    };

    await updateDictionaryItem(item.id, dto);
    await load();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Словари</h1>
      <p className="text-slate-400 mb-6 text-sm">
        Управление структурой данных, формой записей и аналитикой
      </p>

      {/* ВКЛАДКИ */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "WHAT_HAPPENED", label: "Что произошло" },
          { id: "WHAT", label: "Тип активности" },
          { id: "ITEM_NAME", label: "Название элемента" },
          { id: "UNIT", label: "Единицы измерения" },
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

        {tab === "WHAT" && (
          <div>
            <label className="block mb-1 text-sm">Родитель</label>
            <Select
              value={parentId?.toString()}
              onValueChange={(v) => setParentId(Number(v))}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {tab === "WHAT_HAPPENED" && (
          <>
            <div>
              <label className="block mb-1 text-sm">Тип графика</label>
              <Select value={chartType ?? ""} onValueChange={setChartType}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REPS_SUM">REPS_SUM</SelectItem>
                  <SelectItem value="TIME_RANGE">TIME_RANGE</SelectItem>
                  <SelectItem value="COUNT_PER_DAY">COUNT_PER_DAY</SelectItem>
                  <SelectItem value="MOOD_AVERAGE">MOOD_AVERAGE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Конфигурация полей</label>
              <Select
                value={entryConfigId?.toString()}
                onValueChange={(v) => setEntryConfigId(Number(v))}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Выберите конфиг" />
                </SelectTrigger>
                <SelectContent>
                  {entryConfigs.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div>
          <label className="block mb-1 text-sm">Доступ</label>
          <Select
            value={allowedRole ?? "ALL"}
            onValueChange={(v) => setAllowedRole(v === "ALL" ? null : v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
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

      {/* TABLE */}
      <table className="w-full border border-slate-700 rounded">
        <thead className="bg-slate-800">
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Role</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t border-slate-700">
              <td>{i.id}</td>
              <td>{i.label}</td>
              <td>
                <Select
                  value={i.allowedRole ?? "ALL"}
                  onValueChange={(v) =>
                    handleRoleChange(i, v === "ALL" ? null : v)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Все</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td>
                <Switch checked={i.active} onCheckedChange={() => handleToggle(i)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
