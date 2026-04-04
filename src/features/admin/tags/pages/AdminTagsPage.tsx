import { useEffect, useState } from "react";
import {
  approveTag,
  deprecateTag,
  getAdminTags,
  rejectTag,
} from "@/api/admin/adminTagsApi";
import type { Tag } from "@/shared/types/tag";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type Slice<T> = {
  content: T[];
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

type TagStatus = NonNullable<Tag["status"]>;

const STATUS_LABELS: Record<TagStatus, string> = {
  PROPOSED: "Ожидает",
  APPROVED: "Одобрен",
  REJECTED: "Отклонен",
  DEPRECATED: "Устаревший",
};

const getTagStatus = (tag: Tag): TagStatus => tag.status ?? "PROPOSED";

export default function AdminTagsPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Slice<Tag> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [page, query]);

  async function load() {
    try {
      setLoading(true);
      const res = await getAdminTags(page, 20, query.trim() || undefined);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    const ok = confirm("Одобрить тег?");
    if (!ok) return;
    await approveTag(id);
    load();
  }

  async function handleReject(id: number) {
    const ok = confirm("Отклонить тег?");
    if (!ok) return;
    await rejectTag(id);
    load();
  }

  async function handleDeprecate(id: number) {
    const ok = confirm("Сделать тег устаревшим?");
    if (!ok) return;
    await deprecateTag(id);
    load();
  }

  const tags = data?.content ?? [];

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Теги</h1>
      <p className="text-slate-400 mb-6 text-sm">
        Модерация и управление тегами
      </p>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Поиск по тегам..."
          className="max-w-xs"
        />

        <div className="ml-auto text-sm text-slate-400">
          Найдено: {tags.length}
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full table-fixed">
          <thead className="bg-slate-800">
            <tr>
              <th className="w-20 px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Тег</th>
              <th className="w-32 px-3 py-2 text-left">Статус</th>
              <th className="w-72 px-3 py-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                  Загрузка...
                </td>
              </tr>
            )}

            {!loading &&
              tags.map((t) => (
                <tr key={t.id} className="border-t border-slate-700">
                  <td className="px-3 py-2">{t.id}</td>
                  <td className="px-3 py-2 truncate">{t.name}</td>
                  <td className="px-3 py-2">{STATUS_LABELS[getTagStatus(t)]}</td>
                  <td className="px-3 py-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(t.id)}
                      disabled={getTagStatus(t) === "APPROVED"}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(t.id)}
                      disabled={getTagStatus(t) === "REJECTED"}
                    >
                      Отклонить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeprecate(t.id)}
                      disabled={getTagStatus(t) === "DEPRECATED"}
                    >
                      Устаревший
                    </Button>
                  </td>
                </tr>
              ))}

            {!loading && tags.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                  Теги не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={data.first}
          >
            Назад
          </Button>
          <div className="text-sm text-slate-400">
            Страница {data.number + 1}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
}
