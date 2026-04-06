import { type FormEvent, useEffect, useState } from "react";
import { Plus, Search, Tags } from "lucide-react";
import { toast } from "sonner";

import {
  approveTag,
  createAdminTag,
  deprecateTag,
  getAdminTags,
  rejectTag,
} from "@/api/admin/adminTagsApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { AdminTagChartTypesManager } from "@/features/admin/tags/components/AdminTagChartTypesManager";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Tag } from "@/shared/types/tag";

type Slice<T> = {
  content: T[];
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

type PendingAction =
  | {
      title: string;
      description: string;
      confirmLabel: string;
      tone?: "primary" | "danger";
      run: () => Promise<void>;
    }
  | null;

const TAG_STATUSES = ["PROPOSED", "APPROVED", "REJECTED", "DEPRECATED"] as const;

type TagStatus = (typeof TAG_STATUSES)[number];

const STATUS_META: Record<TagStatus, { label: string; badgeClassName: string }> = {
  PROPOSED: {
    label: "Ожидает",
    badgeClassName: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
  APPROVED: {
    label: "Одобрен",
    badgeClassName: "border-primary/30 bg-primary/10 text-primary",
  },
  REJECTED: {
    label: "Отклонен",
    badgeClassName: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  DEPRECATED: {
    label: "Устаревший",
    badgeClassName: "border-slate-500/30 bg-slate-500/10 text-slate-200",
  },
};

function getTagStatus(tag: Tag): TagStatus {
  const status = tag.status;

  if (status && TAG_STATUSES.includes(status as TagStatus)) {
    return status as TagStatus;
  }

  return "PROPOSED";
}

export default function AdminTagsShadcnPage() {
  const [query, setQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Slice<Tag> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    void load();
  }, [page, query]);

  async function load(nextPage = page, nextQuery = query) {
    try {
      setLoading(true);
      const result = await getAdminTags(
        nextPage,
        20,
        nextQuery.trim() || undefined
      );
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newTagName.trim();
    if (!name) {
      toast.error("Введите название тега.");
      return;
    }

    try {
      setIsCreating(true);
      const createdTag = await createAdminTag({ name });
      setNewTagName("");
      setQuery("");
      setPage(0);
      toast.success(`Тег "${createdTag.name}" создан.`);
      await load(0, "");
    } finally {
      setIsCreating(false);
    }
  }

  function requestApprove(tag: Tag) {
    setPendingAction({
      title: "Одобрить тег?",
      description: `Тег "${tag.name}" будет переведен в статус "Одобрен".`,
      confirmLabel: "Одобрить",
      run: async () => {
        await approveTag(tag.id);
        await load();
      },
    });
  }

  function requestReject(tag: Tag) {
    setPendingAction({
      title: "Отклонить тег?",
      description: `Тег "${tag.name}" будет переведен в статус "Отклонен".`,
      confirmLabel: "Отклонить",
      tone: "danger",
      run: async () => {
        await rejectTag(tag.id);
        await load();
      },
    });
  }

  function requestDeprecate(tag: Tag) {
    setPendingAction({
      title: "Сделать тег устаревшим?",
      description: `Тег "${tag.name}" будет помечен как устаревший.`,
      confirmLabel: "Пометить",
      run: async () => {
        await deprecateTag(tag.id);
        await load();
      },
    });
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;

    try {
      setIsMutating(true);
      await pendingAction.run();
      setPendingAction(null);
    } finally {
      setIsMutating(false);
    }
  }

  const tags = data?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Теги</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Модерация пользовательских тегов и управление их жизненным циклом.
        </p>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Создать тег</CardTitle>
          <CardDescription>
            Новый тег будет создан через административный endpoint и сразу
            появится в общем списке.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateTag}
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Plus className="h-4 w-4" />
                Название тега
              </div>
              <Input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                placeholder="Введите название тега..."
                maxLength={255}
                disabled={isCreating}
                className="max-w-xl"
              />
            </div>

            <Button type="submit" disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? "Создание..." : "Создать"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Поиск и состояние списка</CardTitle>
          <CardDescription>
            Поиск по названию тега и быстрый обзор найденных результатов.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              Поиск
            </div>
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Поиск по тегам..."
              className="max-w-xl"
            />
          </div>

          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            Найдено: {tags.length}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Список тегов</CardTitle>
          <CardDescription>
            Статус и действия для каждого тега подтверждаются отдельно.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Тег</TableHead>
                <TableHead className="w-40">Статус</TableHead>
                <TableHead className="w-[280px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Теги не найдены
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => {
                  const status = getTagStatus(tag);

                  return (
                    <TableRow key={tag.id}>
                      <TableCell>{tag.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full font-medium ${STATUS_META[status].badgeClassName}`}
                        >
                          {STATUS_META[status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="surface"
                            disabled={status === "APPROVED" || isMutating}
                            onClick={() => requestApprove(tag)}
                          >
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            disabled={status === "REJECTED" || isMutating}
                            onClick={() => requestReject(tag)}
                            className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
                          >
                            Отклонить
                          </Button>
                          <Button
                            size="sm"
                            variant="surface"
                            disabled={status === "DEPRECATED" || isMutating}
                            onClick={() => requestDeprecate(tag)}
                          >
                            Устаревший
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {data && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Страница {data.number + 1}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="surface"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={data.first || loading}
                >
                  Назад
                </Button>
                <Button
                  variant="surface"
                  size="sm"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={data.last || loading}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminTagChartTypesManager />

      <AdminConfirmationDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !isMutating) {
            setPendingAction(null);
          }
        }}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description ?? ""}
        confirmLabel={pendingAction?.confirmLabel ?? "Подтвердить"}
        tone={pendingAction?.tone ?? "primary"}
        loading={isMutating}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
