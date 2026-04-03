import { useEffect, useState } from "react";
import { Search, Tags } from "lucide-react";

import {
  approveTag,
  deprecateTag,
  getAdminTags,
  rejectTag,
} from "@/api/admin/adminTagsApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
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

const STATUS_LABELS: Record<Tag["status"], string> = {
  PROPOSED: "Ожидает",
  APPROVED: "Одобрен",
  REJECTED: "Отклонен",
  DEPRECATED: "Устаревший",
};

const STATUS_BADGE_CLASS: Record<Tag["status"], string> = {
  PROPOSED: "border-border text-muted-foreground",
  APPROVED: "border-primary/30 text-primary",
  REJECTED: "border-destructive/30 text-destructive",
  DEPRECATED: "border-border text-muted-foreground",
};

export default function AdminTagsShadcnPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Slice<Tag> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    void load();
  }, [page, query]);

  async function load() {
    try {
      setLoading(true);
      const result = await getAdminTags(page, 20, query.trim() || undefined);
      setData(result);
    } finally {
      setLoading(false);
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
                tags.map((tag) => (
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
                        className={`rounded-full ${STATUS_BADGE_CLASS[tag.status]}`}
                      >
                        {STATUS_LABELS[tag.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="surface"
                          disabled={tag.status === "APPROVED" || isMutating}
                          onClick={() => requestApprove(tag)}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          disabled={tag.status === "REJECTED" || isMutating}
                          onClick={() => requestReject(tag)}
                          className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
                        >
                          Отклонить
                        </Button>
                        <Button
                          size="sm"
                          variant="surface"
                          disabled={tag.status === "DEPRECATED" || isMutating}
                          onClick={() => requestDeprecate(tag)}
                        >
                          Устаревший
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
