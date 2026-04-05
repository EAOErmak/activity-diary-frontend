import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Database, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createGeneralFood,
  deleteGeneralFood,
  updateGeneralFood,
} from "@/api/admin/adminGeneralFoodsApi";
import { searchDictionaryAdmin } from "@/api/admin/dictionaryAdminApi";
import { getGeneralFoods } from "@/api/foodApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { FoodFormDialog } from "@/features/food/components/FoodFormDialog";
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
import type { FoodDictionaryOption, GeneralFoodResponseDto, FoodUpsertDto } from "@/shared/types/food";

function formatMacro(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function sortDictionaryOptions(options: FoodDictionaryOption[]) {
  return [...options].sort((left, right) => left.label.localeCompare(right.label, "ru"));
}

function mapDictionaryOptions(options: Array<{ id: number; label: string }>) {
  const seen = new Map<number, FoodDictionaryOption>();

  for (const option of options) {
    if (!seen.has(option.id)) {
      seen.set(option.id, option);
    }
  }

  return sortDictionaryOptions(Array.from(seen.values()));
}

export default function AdminGeneralFoodsShadcnPage() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<GeneralFoodResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<GeneralFoodResponseDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GeneralFoodResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const loadFoods = useCallback(async (nextQuery = deferredQuery) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getGeneralFoods(nextQuery);
      setFoods(data);
    } catch (error) {
      setFoods([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить общую базу продуктов."
      );
    } finally {
      setLoading(false);
    }
  }, [deferredQuery]);

  useEffect(() => {
    void loadFoods(deferredQuery);
  }, [deferredQuery, loadFoods]);

  const loadAdminDictionaryOptions = useCallback(async (search: string) => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      return [];
    }

    const data = await searchDictionaryAdmin(trimmedSearch);

    return mapDictionaryOptions(
      data.map((item) => ({
        id: item.id,
        label: item.label,
      }))
    );
  }, []);

  async function handleCreate(payload: FoodUpsertDto) {
    await createGeneralFood(payload);
    toast.success("Продукт добавлен в общую базу.");
    setCreateOpen(false);
    await loadFoods(query);
  }

  async function handleUpdate(payload: FoodUpsertDto) {
    if (!editingFood) {
      return;
    }

    await updateGeneralFood(editingFood.id, payload);
    toast.success("Продукт обновлен.");
    setEditingFood(null);
    await loadFoods(query);
  }

  async function handleDelete() {
    if (!pendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteGeneralFood(pendingDelete.id);
      toast.success(`Продукт "${pendingDelete.dictionaryItemLabel}" удален.`);
      setPendingDelete(null);
      await loadFoods(query);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Еда</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Управление общей базой продуктов. Эти записи доступны пользователям
            только для просмотра в разделе Еда.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Добавить продукт
        </Button>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Поиск</CardTitle>
          <CardDescription>
            Ищите продукты по названию и управляйте общей базой без перезагрузки
            страницы.
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по общей базе продуктов..."
              className="max-w-xl"
            />
          </div>

          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            <Database className="mr-2 h-3.5 w-3.5" />
            Найдено: {foods.length}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Общая база</CardTitle>
          <CardDescription>
            Создание, редактирование и удаление `GeneralFood` доступно только в
            админ-панели.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Продукт</TableHead>
                <TableHead className="w-28 text-right">Белки</TableHead>
                <TableHead className="w-28 text-right">Жиры</TableHead>
                <TableHead className="w-32 text-right">Углеводы</TableHead>
                <TableHead className="w-36 text-right">Калории на 1 г</TableHead>
                <TableHead className="w-44 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : foods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    В общей базе пока нет продуктов по этому запросу.
                  </TableCell>
                </TableRow>
              ) : (
                foods.map((food) => (
                  <TableRow key={food.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{food.dictionaryItemLabel}</p>
                          <Badge variant="outline" className="rounded-full">
                            #{food.dictionaryItemId}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Общий продукт
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatMacro(food.protein)}</TableCell>
                    <TableCell className="text-right">{formatMacro(food.fat)}</TableCell>
                    <TableCell className="text-right">{formatMacro(food.carbs)}</TableCell>
                    <TableCell className="text-right">{formatMacro(food.callories)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="surface"
                          onClick={() => setEditingFood(food)}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          variant="surface"
                          className="text-destructive"
                          onClick={() => setPendingDelete(food)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FoodFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Новый продукт общей базы"
        submitLabel="Создать продукт"
        searchPlaceholder="Введите название продукта в словаре..."
        selectPlaceholder="Выберите продукт из словаря"
        idleOptionsMessage="Введите запрос, чтобы найти продукт в словаре."
        noOptionsMessage="Подходящие элементы словаря не найдены."
        allowEmptySearch={false}
        loadOptions={loadAdminDictionaryOptions}
        onSubmit={handleCreate}
      />

      {editingFood && (
        <FoodFormDialog
          mode="edit"
          open={editingFood !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingFood(null);
            }
          }}
          title="Редактирование продукта общей базы"
          submitLabel="Сохранить изменения"
          searchPlaceholder="Уточните название продукта в словаре..."
          selectPlaceholder="Выберите продукт из словаря"
          idleOptionsMessage="Введите запрос, чтобы найти продукт в словаре."
          noOptionsMessage="Подходящие элементы словаря не найдены."
          allowEmptySearch={false}
          loadOptions={loadAdminDictionaryOptions}
          initialValues={{
            dictionaryItemId: editingFood.dictionaryItemId,
            dictionaryItemLabel: editingFood.dictionaryItemLabel,
            protein: editingFood.protein,
            fat: editingFood.fat,
            carbs: editingFood.carbs,
            callories: editingFood.callories,
          }}
          onSubmit={handleUpdate}
        />
      )}

      <AdminConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null);
          }
        }}
        title="Удалить продукт?"
        description={
          pendingDelete == null
            ? ""
            : `Продукт "${pendingDelete.dictionaryItemLabel}" будет удален из общей базы.`
        }
        confirmLabel={isDeleting ? "Удаление..." : "Удалить"}
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
