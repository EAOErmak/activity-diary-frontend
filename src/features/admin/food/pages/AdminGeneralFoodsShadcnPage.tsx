import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { getIntlLocale } from "@/shared/i18n/locale";
import { syncGeneralFoodCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import { generalFoodKeys } from "@/shared/lib/queryKeys";
import type {
  FoodDictionaryOption,
  FoodUpsertDto,
  GeneralFoodResponseDto,
} from "@/shared/types/food";

function formatMacro(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function sortDictionaryOptions(options: FoodDictionaryOption[], locale: string) {
  return [...options].sort((left, right) => left.label.localeCompare(right.label, locale));
}

function mapDictionaryOptions(
  options: Array<{ id: number; label: string }>,
  locale: string
) {
  const seen = new Map<number, FoodDictionaryOption>();

  for (const option of options) {
    if (!seen.has(option.id)) {
      seen.set(option.id, option);
    }
  }

  return sortDictionaryOptions(Array.from(seen.values()), locale);
}

export default function AdminGeneralFoodsShadcnPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<GeneralFoodResponseDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GeneralFoodResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const {
    data: foods = [],
    isPending,
    error,
  } = useQuery<GeneralFoodResponseDto[], Error>({
    queryKey: generalFoodKeys.list(deferredQuery),
    queryFn: () => getGeneralFoods(deferredQuery),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

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
      })),
      locale
    );
  }, [locale]);

  const resultLabel = useMemo(
    () =>
      foods.length === 1
        ? t("food.oneProduct")
        : t("food.manyProducts", { count: foods.length }),
    [foods.length, t]
  );

  async function handleCreate(payload: FoodUpsertDto) {
    await createGeneralFood(payload);
    await syncGeneralFoodCachesAfterAdminMutation(queryClient);
    toast.success(t("admin.foodsPage.productCreated"));
    setCreateOpen(false);
  }

  async function handleUpdate(payload: FoodUpsertDto) {
    if (!editingFood) {
      return;
    }

    await updateGeneralFood(editingFood.id, payload);
    await syncGeneralFoodCachesAfterAdminMutation(queryClient);
    toast.success(t("admin.foodsPage.productUpdated"));
    setEditingFood(null);
  }

  async function handleDelete() {
    if (!pendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteGeneralFood(pendingDelete.id);
      await syncGeneralFoodCachesAfterAdminMutation(queryClient);
      toast.success(
        t("admin.foodsPage.productDeleted", {
          label: pendingDelete.dictionaryItemLabel,
        })
      );
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const errorMessage = error?.message ?? null;
  const showInitialLoading = isPending && foods.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.foodsPage.title")}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("admin.foodsPage.subtitle")}
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.foodsPage.addProduct")}
        </Button>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.foodsPage.searchTitle")}</CardTitle>
          <CardDescription>
            {t("admin.foodsPage.searchDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              {t("common.search")}
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.foodsPage.searchPlaceholder")}
              className="max-w-xl"
            />
          </div>

          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            <Database className="mr-2 h-3.5 w-3.5" />
            {resultLabel}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.foodsPage.databaseTitle")}</CardTitle>
          <CardDescription>
            {t("admin.foodsPage.databaseDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("food.product")}</TableHead>
                <TableHead className="w-36 whitespace-nowrap text-right">{t("food.proteins")}</TableHead>
                <TableHead className="w-36 whitespace-nowrap text-right">{t("food.fats")}</TableHead>
                <TableHead className="w-40 whitespace-nowrap text-right">{t("food.carbs")}</TableHead>
                <TableHead className="w-44 whitespace-nowrap text-right">{t("food.caloriesPerGram")}</TableHead>
                <TableHead className="w-44 text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showInitialLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : errorMessage && foods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-destructive">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : foods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t("food.noGeneralProducts")}
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
                          {t("food.sharedProductLabel")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("food.dictionaryItemId", {
                            id: String(food.dictionaryItemId),
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatMacro(food.protein, locale)}</TableCell>
                    <TableCell className="text-right">{formatMacro(food.fat, locale)}</TableCell>
                    <TableCell className="text-right">{formatMacro(food.carbs, locale)}</TableCell>
                    <TableCell className="text-right">{formatMacro(food.callories, locale)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="surface"
                          onClick={() => setEditingFood(food)}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="surface"
                          className="text-destructive"
                          onClick={() => setPendingDelete(food)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete")}
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
        title={t("admin.foodsPage.createDialogTitle")}
        submitLabel={t("admin.foodsPage.createDialogSubmit")}
        searchPlaceholder={t("admin.foodsPage.createSearchPlaceholder")}
        selectPlaceholder={t("admin.foodsPage.selectPlaceholder")}
        idleOptionsMessage={t("admin.foodsPage.idleOptionsMessage")}
        noOptionsMessage={t("admin.foodsPage.noOptionsMessage")}
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
          title={t("admin.foodsPage.editDialogTitle")}
          submitLabel={t("admin.foodsPage.editDialogSubmit")}
          searchPlaceholder={t("admin.foodsPage.editSearchPlaceholder")}
          selectPlaceholder={t("admin.foodsPage.selectPlaceholder")}
          idleOptionsMessage={t("admin.foodsPage.idleOptionsMessage")}
          noOptionsMessage={t("admin.foodsPage.noOptionsMessage")}
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
        title={t("admin.foodsPage.deleteTitle")}
        description={
          pendingDelete == null
            ? ""
            : t("admin.foodsPage.deleteDescription", {
                label: pendingDelete.dictionaryItemLabel,
              })
        }
        confirmLabel={isDeleting ? t("common.deleting") : t("common.delete")}
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
