import { useEffect, useState } from "react";
import {
  getAllAdminEntryConfigs,
  createAdminEntryConfig,
  updateAdminEntryConfig,
} from "@/api/admin/entryFieldConfigAdminApi";

import type { EntryFieldConfig } from "@/shared/types/diary";

type FlagKey =
  | "showSubCategory"
  | "showMetrics"
  | "showMood"
  | "showDescription"
  | "requiredSubCategory"
  | "requiredMetrics";

const DEFAULT_NEW_CONFIG: EntryFieldConfig = {
  name: "",
  showSubCategory: true,
  showMetrics: true,
  showMood: true,
  showDescription: true,
  requiredSubCategory: false,
  requiredMetrics: false,
};

export default function AdminEntryConfigPage() {
  const [configs, setConfigs] = useState<EntryFieldConfig[]>([]);
  const [newConfig, setNewConfig] =
    useState<EntryFieldConfig>(DEFAULT_NEW_CONFIG);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD
  // ============================

  useEffect(() => {
    void loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      const res = await getAllAdminEntryConfigs();
      setConfigs(res);
    } catch (e) {
      alert("Ошибка загрузки конфигов");
    }
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

    const updated: EntryFieldConfig = {
      ...current,
      [key]: !current[key],
    } as EntryFieldConfig;

    // сразу обновляем в UI
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );

    // и отправляем на бэк
    try {
      await updateAdminEntryConfig(id, updated);
    } catch {
      await loadConfigs(); // откат
    }
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
                checked={newConfig.showSubCategory}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showSubCategory: e.target.checked,
                  }))
                }
              />
              showSubCategory
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.showMetrics}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showMetrics: e.target.checked,
                  }))
                }
              />
              showMetrics
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.showMood}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    showMood: e.target.checked,
                  }))
                }
              />
              showMood
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
                checked={newConfig.requiredSubCategory}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    requiredSubCategory: e.target.checked,
                  }))
                }
              />
              requiredSubCategory
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.requiredMetrics}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    requiredMetrics: e.target.checked,
                  }))
                }
              />
              requiredMetrics
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
              <th className="p-2">showSubCategory</th>
              <th className="p-2">showMetrics</th>
              <th className="p-2">showMood</th>
              <th className="p-2">showDescription</th>
              <th className="p-2">requiredSubCategory</th>
              <th className="p-2">requiredMetrics</th>
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
                    checked={c.showSubCategory}
                    onChange={() =>
                      handleToggle(c.id!, "showSubCategory")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.showMetrics}
                    onChange={() =>
                      handleToggle(c.id!, "showMetrics")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.showMood}
                    onChange={() =>
                      handleToggle(c.id!, "showMood")
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
                    checked={c.requiredSubCategory}
                    onChange={() =>
                      handleToggle(c.id!, "requiredSubCategory")
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={c.requiredMetrics}
                    onChange={() =>
                      handleToggle(c.id!, "requiredMetrics")
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
