import { useEffect, useState } from "react";
import {
  getAllAdminEntryConfigs,
  createAdminEntryConfig,
  updateAdminEntryConfig,
} from "@/api/admin/entryFieldConfigAdminApi";

import type { EntryFieldConfigDto } from "@/shared/types/diary";

type FlagKey =
  | "showWhat"
  | "showActivities"
  | "showFeeling"
  | "showDescription"
  | "requiredWhat"
  | "requiredActivities";

const DEFAULT_NEW_CONFIG: EntryFieldConfigDto = {
  name: "",
  showWhat: true,
  showActivities: true,
  showFeeling: true,
  showDescription: true,
  requiredWhat: false,
  requiredActivities: false,
};

export default function AdminEntryConfigPage() {
  const [configs, setConfigs] = useState<EntryFieldConfigDto[]>([]);
  const [newConfig, setNewConfig] =
    useState<EntryFieldConfigDto>(DEFAULT_NEW_CONFIG);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD
  // ============================

  useEffect(() => {
    void loadConfigs();
  }, []);

  async function loadConfigs() {
    const res = await getAllAdminEntryConfigs();
    setConfigs(res.data.data); // ✅ ВАЖНО: .data.data
  }
  
  // ============================
  // CREATE
  // ============================

  async function handleCreate() {
    if (!newConfig.name.trim()) {
      alert("Введите имя конфига");
      return;
    }

    try {
      setLoading(true);
      await createAdminEntryConfig({
        ...newConfig,
        name: newConfig.name.trim(),
      });
      setNewConfig(DEFAULT_NEW_CONFIG);
      await loadConfigs();
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // UPDATE (ТОГГЛЫ)
  // ============================

  async function handleToggle(id: number | undefined, key: FlagKey) {
    if (!id) return;

    const current = configs.find((c) => c.id === id);
    if (!current) return;

    const updated: EntryFieldConfigDto = {
      ...current,
      [key]: !current[key],
    } as EntryFieldConfigDto;

    // сразу обновляем в UI
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );

    // и отправляем на бэк
    await updateAdminEntryConfig(id, updated);
  }

  // ============================
  // RENDER
  // ============================

  return (
    <div className="space-y-6 p-6 text-white">
      <h1 className="text-xl font-bold">Конфигурация полей</h1>

      {/* СОЗДАНИЕ НОВОГО КОНФИГА */}
      <div className="border border-slate-700 rounded p-4 space-y-4">
        <h2 className="font-semibold">Создать новый конфиг</h2>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block mb-1 text-sm">Имя конфига</label>
            <input
              className="bg-slate-800 px-3 py-2 rounded w-[260px]"
              value={newConfig.name}
              onChange={(e) =>
                setNewConfig((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.showWhat}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showWhat: e.target.checked,
                  }))
                }
              />
              showWhat
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.showActivities}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showActivities: e.target.checked,
                  }))
                }
              />
              showActivities
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.showFeeling}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showFeeling: e.target.checked,
                  }))
                }
              />
              showFeeling
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.showDescription}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showDescription: e.target.checked,
                  }))
                }
              />
              showDescription
            </label>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.requiredWhat}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    requiredWhat: e.target.checked,
                  }))
                }
              />
              requiredWhat
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.requiredActivities}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    requiredActivities: e.target.checked,
                  }))
                }
              />
              requiredActivities
            </label>
          </div>

          <button
            className="px-4 py-2 bg-blue-600 rounded"
            onClick={handleCreate}
            disabled={loading}
          >
            Создать
          </button>
        </div>
      </div>

      {/* СПИСОК КОНФИГОВ */}
      <div className="border border-slate-700 rounded">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Имя</th>
              <th className="p-2">showWhat</th>
              <th className="p-2">showActivities</th>
              <th className="p-2">showFeeling</th>
              <th className="p-2">showDescription</th>
              <th className="p-2">requiredWhat</th>
              <th className="p-2">requiredActivities</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr
                key={c.id}
                className="border-t border-slate-700 text-center"
              >
                <td className="p-2 text-left">{c.id}</td>
                <td className="p-2 text-left">{c.name}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.showWhat}
                    onChange={() =>
                      handleToggle(c.id!, "showWhat")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.showActivities}
                    onChange={() =>
                      handleToggle(c.id!, "showActivities")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.showFeeling}
                    onChange={() =>
                      handleToggle(c.id!, "showFeeling")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.showDescription}
                    onChange={() =>
                      handleToggle(c.id!, "showDescription")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.requiredWhat}
                    onChange={() =>
                      handleToggle(c.id!, "requiredWhat")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.requiredActivities}
                    onChange={() =>
                      handleToggle(c.id!, "requiredActivities")
                    }
                  />
                </td>
              </tr>
            ))}

            {configs.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-3 text-center text-slate-400"
                >
                  Конфигов пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
