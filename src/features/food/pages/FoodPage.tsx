import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Database, Plus, Search, UserRound, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import {
  createUserFood,
  deleteUserFood,
  getGeneralFoods,
  getUserFoods,
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
import type {
  FoodDictionaryOption,
  FoodUpsertDto,
  GeneralFoodResponseDto,
  UserFoodResponseDto,
} from "@/shared/types/food";

function formatMacro(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function sortFoodOptions(options: FoodDictionaryOption[]) {
  return [...options].sort((left, right) => left.label.localeCompare(right.label, "ru"));
}

function buildUserFoodOptions(
  generalFoods: GeneralFoodResponseDto[],
  userFoods: UserFoodResponseDto[]
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

  return sortFoodOptions(Array.from(byDictionaryId.values()));
}

export default function FoodPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [generalQuery, setGeneralQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [generalFoods, setGeneralFoods] = useState<GeneralFoodResponseDto[]>([]);
  const [userFoods, setUserFoods] = useState<UserFoodResponseDto[]>([]);
  const [isLoadingGeneralFoods, setIsLoadingGeneralFoods] = useState(false);
  const [isLoadingUserFoods, setIsLoadingUserFoods] = useState(false);
  const [generalFoodsError, setGeneralFoodsError] = useState<string | null>(null);
  const [userFoodsError, setUserFoodsError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<UserFoodResponseDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserFoodResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deferredGeneralQuery = useDeferredValue(generalQuery);
  const deferredUserQuery = useDeferredValue(userQuery);

  const loadGeneralFoods = useCallback(async (query = deferredGeneralQuery) => {
    try {
      setIsLoadingGeneralFoods(true);
      setGeneralFoodsError(null);
      const data = await getGeneralFoods(query);
      setGeneralFoods(data);
    } catch (error) {
      setGeneralFoods([]);
      setGeneralFoodsError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить общую базу продуктов."
      );
    } finally {
      setIsLoadingGeneralFoods(false);
    }
  }, [deferredGeneralQuery]);

  const loadUserFoods = useCallback(async (query = deferredUserQuery) => {
    try {
      setIsLoadingUserFoods(true);
      setUserFoodsError(null);
      const data = await getUserFoods(query);
      setUserFoods(data);
    } catch (error) {
      setUserFoods([]);
      setUserFoodsError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить ваши продукты."
      );
    } finally {
      setIsLoadingUserFoods(false);
    }
  }, [deferredUserQuery]);

  useEffect(() => {
    void loadGeneralFoods(deferredGeneralQuery);
  }, [deferredGeneralQuery, loadGeneralFoods]);

  useEffect(() => {
    void loadUserFoods(deferredUserQuery);
  }, [deferredUserQuery, loadUserFoods]);

  const loadUserFoodOptions = useCallback(async (query: string) => {
    const [general, user] = await Promise.all([
      getGeneralFoods(query),
      getUserFoods(query),
    ]);

    return buildUserFoodOptions(general, user);
  }, []);

  const generalResultLabel = useMemo(
    () =>
      generalFoods.length === 1
        ? "1 продукт"
        : `${generalFoods.length} продуктов`,
    [generalFoods.length]
  );

  const userResultLabel = useMemo(
    () =>
      userFoods.length === 1
        ? "1 продукт"
        : `${userFoods.length} продуктов`,
    [userFoods.length]
  );

  async function handleCreateUserFood(payload: FoodUpsertDto) {
    await createUserFood(payload);
    toast.success("Продукт добавлен.");
    setCreateDialogOpen(false);
    await loadUserFoods(userQuery);
  }

  async function handleUpdateUserFood(payload: FoodUpsertDto) {
    if (!editingFood) {
      return;
    }

    await updateUserFood(editingFood.id, payload);
    toast.success("Продукт обновлен.");
    setEditingFood(null);
    await loadUserFoods(userQuery);
  }

  async function handleDeleteUserFood() {
    if (!pendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUserFood(pendingDelete.id);
      toast.success(`Продукт "${pendingDelete.dictionaryItemLabel}" удален.`);
      setPendingDelete(null);
      await loadUserFoods(userQuery);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-page text-foreground">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Еда</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Просматривайте общую базу продуктов и управляйте своими продуктами с
            индивидуальными значениями БЖУ.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-fit">
            <TabsTrigger value="general">Общая база</TabsTrigger>
            <TabsTrigger value="user">Мои продукты</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="border-border/70 bg-background/95 shadow-sm">
              <CardHeader>
                <CardTitle>Общая база продуктов</CardTitle>
                <CardDescription>
                  Доступна только для просмотра и используется как общий источник
                  продуктовых позиций.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Поиск
                  </div>
                  <Input
                    value={generalQuery}
                    onChange={(event) => setGeneralQuery(event.target.value)}
                    placeholder="Поиск по общей базе продуктов..."
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
                <CardTitle>Список продуктов</CardTitle>
                <CardDescription>
                  Значения БЖУ из общей базы доступны всем пользователям только для
                  просмотра.
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingGeneralFoods ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Загрузка...
                        </TableCell>
                      </TableRow>
                    ) : generalFoodsError ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-destructive">
                          {generalFoodsError}
                        </TableCell>
                      </TableRow>
                    ) : generalFoods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          В общей базе пока нет продуктов по этому запросу.
                        </TableCell>
                      </TableRow>
                    ) : (
                      generalFoods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{food.dictionaryItemLabel}</p>
                              <p className="text-sm text-muted-foreground">
                                dictionaryItemId: {food.dictionaryItemId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatMacro(food.protein)}</TableCell>
                          <TableCell className="text-right">{formatMacro(food.fat)}</TableCell>
                          <TableCell className="text-right">{formatMacro(food.carbs)}</TableCell>
                          <TableCell className="text-right">{formatMacro(food.callories)}</TableCell>
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
                <CardTitle>Мои продукты</CardTitle>
                <CardDescription>
                  Создавайте собственные продуктовые записи, редактируйте их и
                  удаляйте без доступа к общей базе.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Поиск
                  </div>
                  <Input
                    value={userQuery}
                    onChange={(event) => setUserQuery(event.target.value)}
                    placeholder="Поиск по вашим продуктам..."
                    className="max-w-xl"
                  />
                </div>

                <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                  <UserRound className="mr-2 h-3.5 w-3.5" />
                  {userResultLabel}
                </Badge>

                <Button onClick={() => setCreateDialogOpen(true)} className="w-full lg:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить продукт
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/95 shadow-sm">
              <CardHeader>
                <CardTitle>Ваш список</CardTitle>
                <CardDescription>
                  Доступные только вам продуктовые записи с пользовательскими
                  значениями БЖУ.
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
                      <TableHead className="w-40 text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUserFoods ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Загрузка...
                        </TableCell>
                      </TableRow>
                    ) : userFoodsError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-destructive">
                          {userFoodsError}
                        </TableCell>
                      </TableRow>
                    ) : userFoods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          У вас пока нет продуктов по этому запросу.
                        </TableCell>
                      </TableRow>
                    ) : (
                      userFoods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{food.dictionaryItemLabel}</p>
                              <p className="text-sm text-muted-foreground">
                                dictionaryItemId: {food.dictionaryItemId}
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
                                Редактировать
                              </Button>
                              <Button
                                size="sm"
                                variant="surface"
                                className="text-destructive"
                                onClick={() => setPendingDelete(food)}
                              >
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
          </TabsContent>
        </Tabs>
      </div>

      <FoodFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Новый продукт"
        submitLabel="Создать продукт"
        searchPlaceholder="Введите название продукта для поиска..."
        selectPlaceholder="Выберите продукт"
        idleOptionsMessage="Введите запрос, чтобы подобрать продукт из доступной базы."
        noOptionsMessage="Подходящие продукты не найдены."
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
          title="Редактирование продукта"
          submitLabel="Сохранить изменения"
          searchPlaceholder="Уточните название продукта..."
          selectPlaceholder="Выберите продукт"
          idleOptionsMessage="Введите запрос, чтобы подобрать продукт из доступной базы."
          noOptionsMessage="Подходящие продукты не найдены."
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
        title="Удалить продукт?"
        description={
          pendingDelete == null
            ? ""
            : `Продукт "${pendingDelete.dictionaryItemLabel}" будет удален из вашего списка.`
        }
        confirmLabel={isDeleting ? "Удаление..." : "Удалить"}
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDeleteUserFood}
      />
    </div>
  );
}
