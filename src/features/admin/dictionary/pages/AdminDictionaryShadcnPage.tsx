import { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  createDictionaryItem,
  getDictionaryByTypeAdmin,
  updateDictionaryItem,
} from "@/api/admin/dictionaryAdminApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { refreshDictionaryCache } from "@/shared/lib/refreshDictionaryCache";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type {
  DictionaryCreate,
  DictionaryResponse,
  DictionaryUpdate,
} from "@/shared/types/adminDictionary";

type Tab = "METRIC_NAME" | "METRIC_UNIT";

type PendingAction =
  | {
      title: string;
      description: string;
      confirmLabel: string;
      run: () => Promise<void>;
    }
  | null;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "METRIC_NAME", label: "Название активности" },
  { id: "METRIC_UNIT", label: "Единицы измерения" },
];

export default function AdminDictionaryShadcnPage() {
  const [tab, setTab] = useState<Tab>("METRIC_NAME");
  const [items, setItems] = useState<DictionaryResponse[]>([]);
  const [label, setLabel] = useState("");
  const [allowedRole, setAllowedRole] = useState<string | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    void load();
  }, [tab]);

  async function load() {
    try {
      setIsLoadingItems(true);
      const data = await getDictionaryByTypeAdmin(tab);
      setItems(data);
      await refreshDictionaryCache();
    } catch (error) {
      console.error(error);
      toast.error("Не удалось загрузить словарь.");
    } finally {
      setIsLoadingItems(false);
    }
  }

  async function handleCreate() {
    if (!label.trim()) {
      toast.error("Введите название элемента.");
      return;
    }

    const payload: DictionaryCreate = {
      type: tab,
      label: label.trim(),
      allowedRole,
    };

    try {
      setIsCreating(true);
      await createDictionaryItem(payload);
      setLabel("");
      setAllowedRole(null);
      await load();
    } finally {
      setIsCreating(false);
    }
  }

  function requestToggle(item: DictionaryResponse) {
    setPendingAction({
      title: item.active ? "Деактивировать элемент?" : "Активировать элемент?",
      description: `Подтвердите изменение состояния для "${item.label}".`,
      confirmLabel: item.active ? "Деактивировать" : "Активировать",
      run: async () => {
        const payload: DictionaryUpdate = {
          active: !item.active,
        };

        await updateDictionaryItem(item.id, payload);
        await load();
      },
    });
  }

  function requestRoleChange(
    item: DictionaryResponse,
    role: string | null
  ) {
    setPendingAction({
      title: "Изменить доступ?",
      description: `Подтвердите изменение доступа для "${item.label}".`,
      confirmLabel: "Сохранить доступ",
      run: async () => {
        const payload: DictionaryUpdate = {
          allowedRole: role,
        };

        await updateDictionaryItem(item.id, payload);
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Словари</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Управление справочниками активности и единиц измерения через общие
          UI-компоненты админки.
        </p>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Тип словаря</CardTitle>
          <CardDescription>
            Выберите набор данных, с которым хотите работать.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {TABS.map((item) => (
            <Button
              key={item.id}
              variant={tab === item.id ? "primary" : "surface"}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Добавить элемент</CardTitle>
          <CardDescription>
            Новый элемент появится в выбранном словаре после сохранения.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Название
            </div>
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Введите название..."
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Доступ</p>
            <Select
              value={allowedRole ?? "ALL"}
              onValueChange={(value) =>
                setAllowedRole(value === "ALL" ? null : value)
              }
            >
              <SelectTrigger>
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

          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Создание..." : "Создать"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Элементы словаря</CardTitle>
            <CardDescription>
              Меняй доступ и активность элементов с подтверждением.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            Всего: {items.length}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="w-[240px]">Роль доступа</TableHead>
                <TableHead className="w-32 text-center">Активен</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingItems ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    В текущем словаре нет элементов.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.allowedRole ?? "ALL"}
                        onValueChange={(value) =>
                          requestRoleChange(
                            item,
                            value === "ALL" ? null : value
                          )
                        }
                        disabled={isMutating}
                      >
                        <SelectTrigger className="min-w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Все</SelectItem>
                          <SelectItem value="USER">Пользователь</SelectItem>
                          <SelectItem value="ADMIN">Администратор</SelectItem>
                          <SelectItem value="PREMIUM">Премиум</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            item.active
                              ? "rounded-full border-primary/30 text-primary"
                              : "rounded-full"
                          }
                        >
                          {item.active ? "Да" : "Нет"}
                        </Badge>
                        <Switch
                          checked={item.active}
                          onCheckedChange={() => requestToggle(item)}
                          disabled={isMutating}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
        loading={isMutating}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
