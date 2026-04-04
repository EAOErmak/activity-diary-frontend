import { useEffect, useMemo, useState } from "react";
import { BookOpen, Link2, Plus, Ruler, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { adminMetricLinksApi } from "@/api/admin/adminMetricLinksApi";
import { getDictionaryByTypeAdmin } from "@/api/admin/dictionaryAdminApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { DictionaryResponse } from "@/shared/types/adminDictionary";
import type { MetricLinkResponse } from "@/shared/types/adminMetricLink";

function sortDictionaryItems(items: DictionaryResponse[]) {
  return [...items].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return left.label.localeCompare(right.label, "ru");
  });
}

function formatDictionaryOption(item: DictionaryResponse) {
  return item.active ? item.label : `${item.label} (inactive)`;
}

export default function AdminMetricLinksShadcnPage() {
  const [metricNames, setMetricNames] = useState<DictionaryResponse[]>([]);
  const [metricUnits, setMetricUnits] = useState<DictionaryResponse[]>([]);
  const [linkedUnits, setLinkedUnits] = useState<MetricLinkResponse[]>([]);
  const [selectedMetricNameId, setSelectedMetricNameId] = useState<number | null>(null);
  const [selectedMetricUnitId, setSelectedMetricUnitId] = useState<number | null>(null);
  const [isLoadingDictionaries, setIsLoadingDictionaries] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MetricLinkResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void loadDictionaries();
  }, []);

  useEffect(() => {
    if (selectedMetricNameId == null) {
      setLinkedUnits([]);
      return;
    }

    void loadLinks(selectedMetricNameId);
  }, [selectedMetricNameId]);

  const linkedUnitIds = useMemo(
    () => new Set(linkedUnits.map((unit) => unit.id)),
    [linkedUnits]
  );

  const availableUnits = useMemo(
    () => metricUnits.filter((unit) => !linkedUnitIds.has(unit.id)),
    [linkedUnitIds, metricUnits]
  );

  const selectedMetricName = useMemo(
    () => metricNames.find((metricName) => metricName.id === selectedMetricNameId) ?? null,
    [metricNames, selectedMetricNameId]
  );

  const linkedUnitsWithMeta = useMemo(
    () =>
      linkedUnits.map((linkedUnit) => ({
        ...linkedUnit,
        dictionaryUnit:
          metricUnits.find((metricUnit) => metricUnit.id === linkedUnit.id) ?? null,
      })),
    [linkedUnits, metricUnits]
  );

  useEffect(() => {
    setSelectedMetricUnitId((current) => {
      if (current == null) {
        return current;
      }

      return availableUnits.some((unit) => unit.id === current) ? current : null;
    });
  }, [availableUnits]);

  async function loadDictionaries() {
    try {
      setIsLoadingDictionaries(true);

      const [metricNamesData, metricUnitsData] = await Promise.all([
        getDictionaryByTypeAdmin("METRIC_NAME"),
        getDictionaryByTypeAdmin("METRIC_UNIT"),
      ]);

      const nextMetricNames = sortDictionaryItems(metricNamesData);
      const nextMetricUnits = sortDictionaryItems(metricUnitsData);

      setMetricNames(nextMetricNames);
      setMetricUnits(nextMetricUnits);
      setSelectedMetricNameId((current) => {
        if (
          current != null &&
          nextMetricNames.some((metricName) => metricName.id === current)
        ) {
          return current;
        }

        return nextMetricNames[0]?.id ?? null;
      });
    } catch (error) {
      console.error(error);
      toast.error("Не удалось загрузить словари для связей метрик.");
    } finally {
      setIsLoadingDictionaries(false);
    }
  }

  async function loadLinks(metricNameId: number) {
    try {
      setIsLoadingLinks(true);
      const data = await adminMetricLinksApi.getUnitsByMetricNameAdmin(metricNameId);
      setLinkedUnits(data);
    } catch (error) {
      console.error(error);
      setLinkedUnits([]);
      toast.error("Не удалось загрузить связи для выбранной метрики.");
    } finally {
      setIsLoadingLinks(false);
    }
  }

  async function handleCreate() {
    if (selectedMetricNameId == null) {
      toast.error("Выберите metric name.");
      return;
    }

    if (selectedMetricUnitId == null) {
      toast.error("Выберите unit для связи.");
      return;
    }

    try {
      setIsCreating(true);
      await adminMetricLinksApi.createMetricLink({
        metricNameId: selectedMetricNameId,
        metricUnitId: selectedMetricUnitId,
      });
      setSelectedMetricUnitId(null);
      await loadLinks(selectedMetricNameId);
      toast.success("Связь создана.");
    } catch {
      // axios interceptor already shows the backend error
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete() {
    if (selectedMetricNameId == null || pendingDelete == null) {
      return;
    }

    try {
      setIsDeleting(true);
      await adminMetricLinksApi.deleteMetricLink(
        selectedMetricNameId,
        pendingDelete.id
      );
      setPendingDelete(null);
      await loadLinks(selectedMetricNameId);
      toast.success("Связь удалена.");
    } catch {
      // axios interceptor already shows the backend error
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          Metric Links
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Связи метрик</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Настройте, какие единицы измерения доступны для каждого metric name в
          формах создания и редактирования записей, шаблонов и goals.
        </p>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Выбор метрики</CardTitle>
          <CardDescription>
            Сначала выберите metric name, для которого нужно управлять списком
            разрешенных units.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Metric name
            </div>
            <Select
              value={selectedMetricNameId != null ? String(selectedMetricNameId) : ""}
              onValueChange={(value) => setSelectedMetricNameId(Number(value))}
              disabled={isLoadingDictionaries || metricNames.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingDictionaries
                      ? "Загрузка metric names..."
                      : "Выберите metric name"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {metricNames.map((metricName) => (
                  <SelectItem key={metricName.id} value={String(metricName.id)}>
                    {formatDictionaryOption(metricName)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            Связей: {linkedUnits.length}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>Добавить связь</CardTitle>
          <CardDescription>
            Новая связь определяет, какие units вернет backend для выбранного
            metric name.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ruler className="h-4 w-4" />
              Unit
            </div>
            <Select
              value={selectedMetricUnitId != null ? String(selectedMetricUnitId) : ""}
              onValueChange={(value) => setSelectedMetricUnitId(Number(value))}
              disabled={
                selectedMetricNameId == null ||
                isLoadingDictionaries ||
                isLoadingLinks ||
                availableUnits.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedMetricNameId == null
                      ? "Сначала выберите metric name"
                      : availableUnits.length === 0
                        ? "Все units уже связаны"
                        : "Выберите unit"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {formatDictionaryOption(unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              isCreating ||
              selectedMetricNameId == null ||
              selectedMetricUnitId == null
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Создание..." : "Создать связь"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Текущие связи</CardTitle>
            <CardDescription>
              {selectedMetricName
                ? `Units, доступные для "${selectedMetricName.label}".`
                : "Выберите metric name, чтобы увидеть связанные units."}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            <Link2 className="mr-2 h-3.5 w-3.5" />
            {linkedUnits.length}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-32 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMetricNameId == null ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Выберите metric name.
                  </TableCell>
                </TableRow>
              ) : isLoadingLinks ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Загрузка связей...
                  </TableCell>
                </TableRow>
              ) : linkedUnitsWithMeta.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Для этой метрики пока нет связанных units.
                  </TableCell>
                </TableRow>
              ) : (
                linkedUnitsWithMeta.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.id}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{unit.label}</p>
                        <p className="text-sm text-muted-foreground">metricUnitId</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          unit.dictionaryUnit?.active === false
                            ? "rounded-full border-destructive/30 text-destructive"
                            : "rounded-full border-primary/30 text-primary"
                        }
                      >
                        {unit.dictionaryUnit?.active === false ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="surface"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setPendingDelete(unit)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null);
          }
        }}
        title="Удалить связь?"
        description={
          pendingDelete == null
            ? ""
            : `Unit "${pendingDelete.label}" больше не будет доступен для выбранного metric name.`
        }
        confirmLabel={isDeleting ? "Удаление..." : "Удалить связь"}
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
