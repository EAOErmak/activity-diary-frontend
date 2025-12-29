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

import { getAllAdminEntryConfigs } from "@/api/admin/entryFieldConfigAdminApi";
import type { EntryFieldConfig } from "@/shared/types/diary";

type Tab = "CATEGORY" | "SUB_CATEGORY" | "METRIC_NAME" | "METRIC_UNIT";

export default function AdminDictionaryPage() {
  const [tab, setTab] = useState<Tab>("CATEGORY");
  const [items, setItems] = useState<DictionaryResponse[]>([]);
  const [parents, setParents] = useState<DictionaryResponse[]>([]);
  const [entryConfigs, setEntryConfigs] = useState<EntryFieldConfig[]>([]);

  const [label, setLabel] = useState("");
  const [allowedRole, setAllowedRole] = useState<string | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"REPS_SUM" | "TIME_RANGE" | "COUNT_PER_DAY" | "MOOD_AVERAGE" | null>(null);

  const [entryConfigId, setEntryConfigId] = useState<number | null>(null);

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

      if (tab === "SUB_CATEGORY") {
        const parents = await getDictionaryByTypeAdmin("CATEGORY");
        setParents(parents);
      } else {
        setParents([]);
        setParentId(null);
      }

      if (tab === "CATEGORY") {
        const configs = await getAllAdminEntryConfigs();
        setEntryConfigs(configs);
      } else {
        setEntryConfigs([]);
        setEntryConfigId(null);
        setChartType(null);
      }
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

    if (tab === "SUB_CATEGORY" && !parentId)
      return alert("Выберите родительскую категорию");

    if (tab === "CATEGORY" && !chartType)
      return alert("Выберите тип графика");

    if (tab === "CATEGORY" && !entryConfigId)
      return alert("Выберите конфигурацию полей");

    const dto: DictionaryCreate = {
      type: tab,
      label: label.trim(),
      allowedRole,
      parentId: tab === "SUB_CATEGORY" ? parentId! : undefined,
      chartType: tab === "CATEGORY" ? chartType! : undefined,
      entryFieldConfigId: tab === "CATEGORY" ? entryConfigId! : undefined,
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
        Управление структурой данных, формой записей и аналитикой
      </p>

      {/* ВКЛАДКИ */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "CATEGORY", label: "Что произошло" },
          { id: "SUB_CATEGORY", label: "Тип активности" },
          { id: "METRIC_NAME", label: "Название элемента" },
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

        {tab === "SUB_CATEGORY" && (
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

        {tab === "CATEGORY" && (
          <>
            <div>
              <label className="block mb-1 text-sm">Тип графика</label>
              <Select value={chartType ?? ""} onValueChange={(v) =>
                setChartType(
                  v as "REPS_SUM" | "TIME_RANGE" | "COUNT_PER_DAY" | "MOOD_AVERAGE"
                )
              }>
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
              <SelectItem value="PREMIUM">PREMIUM</SelectItem>
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
