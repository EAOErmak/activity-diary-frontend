import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Plus, Search, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  createUserFood,
  deleteUserFood,
  updateUserFood,
} from "@/api/foodApi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getIntlLocale } from "@/shared/i18n/locale";
import { foodKeys } from "@/shared/lib/queryKeys";
import {
  getGeneralFoodsQueryOptions,
  getUserFoodsQueryOptions,
} from "@/shared/lib/queryOptions";
import type {
  FoodDictionaryOption,
  FoodUpsertDto,
  GeneralFoodResponseDto,
  UserFoodResponseDto,
} from "@/shared/types/food";

function formatMacro(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function sortFoodOptions(options: FoodDictionaryOption[], locale: string) {
  return [...options].sort((left, right) => left.label.localeCompare(right.label, locale));
}

function buildUserFoodOptions(
  generalFoods: GeneralFoodResponseDto[],
  userFoods: UserFoodResponseDto[],
  locale: string
) {
  const byDictionaryId = new Map<number, FoodDictionaryOption>();

  for (const food of [...generalFoods, ...userFoods]) {
    if (!byDictionaryId.has(food.dictionaryItemId)) {
      byDictionaryId.set(food.dictionaryItemId, {
        id: food.dictionaryItemId,
        label: food.dictionaryItemLabel,
      });
    }
  }

  return sortFoodOptions(Array.from(byDictionaryId.values()), locale);
}

export default function FoodPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [activeTab, setActiveTab] = useState("general");
  const [generalQuery, setGeneralQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<UserFoodResponseDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserFoodResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deferredGeneralQuery = useDeferredValue(generalQuery);
  const deferredUserQuery = useDeferredValue(userQuery);

  const {
    data: generalFoods = [],
    isPending: isGeneralFoodsPending,
    error: generalFoodsError,
  } = useQuery<GeneralFoodResponseDto[], Error>(
    getGeneralFoodsQueryOptions(deferredGeneralQuery)
  );
  const {
    data: userFoods = [],
    isPending: isLoadingUserFoods,
    error: userFoodsError,
  } = useQuery<UserFoodResponseDto[], Error>(
    getUserFoodsQueryOptions(deferredUserQuery)
  );

  const loadUserFoodOptions = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    const [general, user] = await Promise.all([
      queryClient.fetchQuery(getGeneralFoodsQueryOptions(trimmedQuery)),
      queryClient.fetchQuery(getUserFoodsQueryOptions(trimmedQuery)),
    ]);

    return buildUserFoodOptions(general, user, locale);
  }, [locale, queryClient]);

  const generalResultLabel = useMemo(
    () =>
      generalFoods.length === 1
        ? t("food.oneProduct")
        : t("food.manyProducts", { count: generalFoods.length }),
    [generalFoods.length, t]
  );

  const userResultLabel = useMemo(
    () =>
      userFoods.length === 1
        ? t("food.oneProduct")
        : t("food.manyProducts", { count: userFoods.length }),
    [t, userFoods.length]
  );

  async function handleCreateUserFood(payload: FoodUpsertDto) {
    await createUserFood(payload);
    await queryClient.invalidateQueries({ queryKey: foodKeys.userFoods() });
    toast.success(t("food.productCreated"));
    setCreateDialogOpen(false);
  }

  async function handleUpdateUserFood(payload: FoodUpsertDto) {
    if (!editingFood) {
      return;
    }

    await updateUserFood(editingFood.id, payload);
    await queryClient.invalidateQueries({ queryKey: foodKeys.userFoods() });
    toast.success(t("food.productUpdated"));
    setEditingFood(null);
  }

  async function handleDeleteUserFood() {
    if (!pendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUserFood(pendingDelete.id);
      await queryClient.invalidateQueries({ queryKey: foodKeys.userFoods() });
      toast.success(t("food.productDeleted", { label: pendingDelete.dictionaryItemLabel }));
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const generalFoodsErrorMessage = generalFoodsError?.message ?? null;
  const userFoodsErrorMessage = userFoodsError?.message ?? null;
  const showInitialGeneralFoodsLoading =
    isGeneralFoodsPending && generalFoods.length === 0;

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("food.title")}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("food.subtitle")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-fit">
            <TabsTrigger value="general">{t("food.generalTab")}</TabsTrigger>
            <TabsTrigger value="user">{t("food.userTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="border-border/70 bg-background/95 shadow-sm">
              <CardHeader>
                <CardTitle>{t("food.generalBaseTitle")}</CardTitle>
                <CardDescription>
                  {t("food.generalBaseDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    {t("food.search")}
                  </div>
                  <Input
                    value={generalQuery}
                    onChange={(event) => setGeneralQuery(event.target.value)}
                    placeholder={t("food.generalSearchPlaceholder")}
                    className="max-w-xl"
                  />
                </div>

                <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                  <Database className="mr-2 h-3.5 w-3.5" />
                  {generalResultLabel}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/95 shadow-sm">
              <CardHeader>
                <CardTitle>{t("food.productsListTitle")}</CardTitle>
                <CardDescription>
                  {t("food.productsListDescription")}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {showInitialGeneralFoodsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          {t("common.loading")}
                        </TableCell>
                      </TableRow>
                    ) : generalFoodsErrorMessage && generalFoods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-destructive">
                          {generalFoodsErrorMessage}
                        </TableCell>
                      </TableRow>
                    ) : generalFoods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          {t("food.noGeneralProducts")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      generalFoods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{food.dictionaryItemLabel}</p>
                              <p className="text-sm text-muted-foreground">
                                {t("food.dictionaryItemId", { id: String(food.dictionaryItemId) })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatMacro(food.protein, locale)}</TableCell>
                          <TableCell className="text-right">{formatMacro(food.fat, locale)}</TableCell>
                          <TableCell className="text-right">{formatMacro(food.carbs, locale)}</TableCell>
                          <TableCell className="text-right">{formatMacro(food.callories, locale)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            <Card className="border-border/70 bg-background/95 shadow-sm">
              <CardHeader>
                <CardTitle>{t("food.userProductsTitle")}</CardTitle>
                <CardDescription>
                  {t("food.userProductsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    {t("food.search")}
                  </div>
                  <Input
                    value={userQuery}
                    onChange={(event) => setUserQuery(event.target.value)}
                    placeholder={t("food.userSearchPlaceholder")}
                    className="max-w-xl"
                  />
                </div>

                <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                  <UserRound className="mr-2 h-3.5 w-3.5" />
                  {userResultLabel}
                </Badge>

                <Button onClick={() => setCreateDialogOpen(true)} className="w-full lg:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("food.addProduct")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/95 shadow-sm">
              <CardHeader>
                <CardTitle>{t("food.yourListTitle")}</CardTitle>
                <CardDescription>
                  {t("food.yourListDescription")}
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
                      <TableHead className="w-40 text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUserFoods ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          {t("common.loading")}
                        </TableCell>
                      </TableRow>
                    ) : userFoodsErrorMessage ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-destructive">
                          {userFoodsErrorMessage}
                        </TableCell>
                      </TableRow>
                    ) : userFoods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          {t("food.noUserProducts")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      userFoods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{food.dictionaryItemLabel}</p>
                              <p className="text-sm text-muted-foreground">
                                {t("food.dictionaryItemId", { id: String(food.dictionaryItemId) })}
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
                                {t("common.edit")}
                              </Button>
                              <Button
                                size="sm"
                                variant="surface"
                                className="text-destructive"
                                onClick={() => setPendingDelete(food)}
                              >
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
          </TabsContent>
        </Tabs>
      </div>

      <FoodFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={t("food.createTitle")}
        submitLabel={t("food.createSubmit")}
        searchPlaceholder={t("food.createSearchPlaceholder")}
        selectPlaceholder={t("food.selectProduct")}
        idleOptionsMessage={t("food.idleOptionsMessage")}
        noOptionsMessage={t("food.noOptionsMessage")}
        allowEmptySearch
        loadOptions={loadUserFoodOptions}
        onSubmit={handleCreateUserFood}
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
          title={t("food.editTitle")}
          submitLabel={t("common.saveChanges")}
          searchPlaceholder={t("food.editSearchPlaceholder")}
          selectPlaceholder={t("food.selectProduct")}
          idleOptionsMessage={t("food.idleOptionsMessage")}
          noOptionsMessage={t("food.noOptionsMessage")}
          allowEmptySearch
          loadOptions={loadUserFoodOptions}
          initialValues={{
            dictionaryItemId: editingFood.dictionaryItemId,
            dictionaryItemLabel: editingFood.dictionaryItemLabel,
            protein: editingFood.protein,
            fat: editingFood.fat,
            carbs: editingFood.carbs,
            callories: editingFood.callories,
          }}
          onSubmit={handleUpdateUserFood}
        />
      )}

      <AdminConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null);
          }
        }}
        title={t("food.deleteTitle")}
        description={
          pendingDelete == null
            ? ""
            : t("food.deleteDescription", { label: pendingDelete.dictionaryItemLabel })
        }
        confirmLabel={isDeleting ? t("common.deleting") : t("common.delete")}
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDeleteUserFood}
      />
    </div>
  );
}
