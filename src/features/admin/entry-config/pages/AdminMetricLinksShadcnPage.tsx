import { useEffect, useMemo, useState } from "react";
import { BookOpen, Link2, Plus, Ruler, Search, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { adminMetricLinksApi } from "@/api/admin/adminMetricLinksApi";
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
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { getIntlLocale } from "@/shared/i18n/locale";
import { syncMetricUnitLinkCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import {
  getAdminDictionaryByTypeQueryOptions,
  getAdminMetricLinksQueryOptions,
} from "@/shared/lib/queryOptions";
import type {
  AdminDictionaryListResponse,
  DictionaryResponse,
} from "@/shared/types/adminDictionary";
import type { MetricLinkResponse } from "@/shared/types/adminMetricLink";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

function sortDictionaryItems(items: DictionaryResponse[], locale: string) {
  return [...items].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    const labelCompare = left.label.localeCompare(right.label, locale);
    return labelCompare || left.id - right.id;
  });
}

function formatDictionaryOption(
  item: Pick<DictionaryResponse, "label" | "active">,
  inactiveSuffix: string
) {
  return item.active ? item.label : `${item.label} (${inactiveSuffix})`;
}

function upsertDictionaryOption(
  items: DictionaryResponse[],
  selectedItem: DictionaryResponse | null,
  locale: string
) {
  if (selectedItem == null || items.some((item) => item.id === selectedItem.id)) {
    return sortDictionaryItems(items, locale);
  }

  return sortDictionaryItems([...items, selectedItem], locale);
}

function mergeDictionaryLookup(
  current: Record<number, DictionaryResponse>,
  items: DictionaryResponse[]
) {
  if (items.length === 0) {
    return current;
  }

  let changed = false;
  const next = { ...current };

  for (const item of items) {
    if (next[item.id] !== item) {
      next[item.id] = item;
      changed = true;
    }
  }

  return changed ? next : current;
}

export default function AdminMetricLinksShadcnPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const inactiveSuffix = t("admin.metricLinksPage.inactiveSuffix");

  const [metricNameQuery, setMetricNameQuery] = useState("");
  const [metricNamePage, setMetricNamePage] = useState(DEFAULT_PAGE);
  const [unitQuery, setUnitQuery] = useState("");
  const [unitPage, setUnitPage] = useState(DEFAULT_PAGE);
  const [selectedMetricName, setSelectedMetricName] = useState<DictionaryResponse | null>(null);
  const [selectedMetricUnit, setSelectedMetricUnit] = useState<DictionaryResponse | null>(null);
  const [knownMetricUnits, setKnownMetricUnits] = useState<Record<number, DictionaryResponse>>(
    {}
  );
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MetricLinkResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedMetricNameQuery = useDebouncedValue(metricNameQuery.trim(), 300);
  const debouncedUnitQuery = useDebouncedValue(unitQuery.trim(), 300);
  const selectedMetricNameId = selectedMetricName?.id ?? null;
  const selectedMetricUnitId = selectedMetricUnit?.id ?? null;

  const metricNamesQuery = useQuery<AdminDictionaryListResponse, Error>(
    getAdminDictionaryByTypeQueryOptions({
      type: "METRIC_NAME",
      page: metricNamePage,
      limit: DEFAULT_LIMIT,
      q: debouncedMetricNameQuery,
    })
  );
  const metricUnitsQuery = useQuery<AdminDictionaryListResponse, Error>(
    getAdminDictionaryByTypeQueryOptions({
      type: "METRIC_UNIT",
      page: unitPage,
      limit: DEFAULT_LIMIT,
      q: debouncedUnitQuery,
    })
  );
  const {
    data: linkedUnits = [],
    isPending: isLoadingLinks,
    error: linkedUnitsError,
  } = useQuery<MetricLinkResponse[], Error>({
    ...getAdminMetricLinksQueryOptions(selectedMetricNameId ?? 0),
    enabled: selectedMetricNameId != null,
  });

  const metricNameItems = metricNamesQuery.data?.items ?? [];
  const metricUnitItems = metricUnitsQuery.data?.items ?? [];

  useEffect(() => {
    setKnownMetricUnits((current) => mergeDictionaryLookup(current, metricUnitItems));
  }, [metricUnitItems]);

  useEffect(() => {
    if (metricNameItems.length === 0 || selectedMetricName != null) {
      return;
    }

    setSelectedMetricName(metricNameItems[0] ?? null);
  }, [metricNameItems, selectedMetricName]);

  const metricNames = useMemo(
    () => upsertDictionaryOption(metricNameItems, selectedMetricName, locale),
    [locale, metricNameItems, selectedMetricName]
  );

  const linkedUnitIds = useMemo(
    () => new Set(linkedUnits.map((unit) => unit.id)),
    [linkedUnits]
  );

  const availableUnits = useMemo(() => {
    const filteredUnits = metricUnitItems.filter((unit) => !linkedUnitIds.has(unit.id));
    return upsertDictionaryOption(filteredUnits, selectedMetricUnit, locale).filter(
      (unit) => !linkedUnitIds.has(unit.id) || unit.id === selectedMetricUnitId
    );
  }, [linkedUnitIds, locale, metricUnitItems, selectedMetricUnit, selectedMetricUnitId]);

  const linkedUnitsWithMeta = useMemo(
    () =>
      linkedUnits.map((linkedUnit) => ({
        ...linkedUnit,
        dictionaryUnit: knownMetricUnits[linkedUnit.id] ?? null,
      })),
    [knownMetricUnits, linkedUnits]
  );

  const isLoadingDictionaries = metricNamesQuery.isPending || metricUnitsQuery.isPending;
  const dictionariesErrorMessage =
    metricNamesQuery.error?.message ?? metricUnitsQuery.error?.message ?? null;
  const linksErrorMessage = linkedUnitsError?.message ?? null;

  async function handleCreate() {
    if (selectedMetricNameId == null) {
      toast.error(t("admin.metricLinksPage.metricRequired"));
      return;
    }

    if (selectedMetricUnitId == null) {
      toast.error(t("admin.metricLinksPage.unitRequired"));
      return;
    }

    try {
      setIsCreating(true);
      const createdLink = await adminMetricLinksApi.createMetricLink({
        metricNameId: selectedMetricNameId,
        metricUnitId: selectedMetricUnitId,
      });
      queryClient.setQueryData<MetricLinkResponse[]>(
        getAdminMetricLinksQueryOptions(selectedMetricNameId).queryKey,
        (current = []) => {
          if (current.some((link) => link.id === createdLink.id)) {
            return current;
          }

          return [...current, createdLink];
        }
      );
      await syncMetricUnitLinkCachesAfterAdminMutation(
        queryClient,
        selectedMetricNameId
      );
      setSelectedMetricUnit(null);
      toast.success(t("admin.metricLinksPage.linkCreated"));
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
      queryClient.setQueryData<MetricLinkResponse[]>(
        getAdminMetricLinksQueryOptions(selectedMetricNameId).queryKey,
        (current = []) =>
          current.filter((linkedUnit) => linkedUnit.id !== pendingDelete.id)
      );
      await syncMetricUnitLinkCachesAfterAdminMutation(
        queryClient,
        selectedMetricNameId
      );
      setPendingDelete(null);
      toast.success(t("admin.metricLinksPage.linkDeleted"));
    } catch {
      // axios interceptor already shows the backend error
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-transparent px-3 py-1"
        >
          {t("admin.metricLinksPage.badge")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.metricLinksPage.title")}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("admin.metricLinksPage.subtitle")}
        </p>
      </div>

      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.metricLinksPage.selectMetricTitle")}</CardTitle>
          <CardDescription>
            {t("admin.metricLinksPage.selectMetricDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                {t("common.search")}
              </div>
              <Input
                value={metricNameQuery}
                onChange={(event) => {
                  setMetricNameQuery(event.target.value);
                  setMetricNamePage(DEFAULT_PAGE);
                }}
                placeholder={t("admin.metricLinksPage.metricNameLabel")}
                className="max-w-xl"
              />
            </div>

            <Badge
              variant="outline"
              className="w-fit rounded-full border-transparent px-3 py-1"
            >
              {t("admin.metricLinksPage.linksCount", {
                count: linkedUnits.length,
              })}
            </Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {t("admin.metricLinksPage.metricNameLabel")}
              </div>
              <Select
                value={selectedMetricNameId != null ? String(selectedMetricNameId) : ""}
                onValueChange={(value) => {
                  const nextMetricName =
                    metricNames.find((metricName) => metricName.id === Number(value)) ?? null;

                  setSelectedMetricName(nextMetricName);
                  setSelectedMetricUnit(null);
                }}
                disabled={isLoadingDictionaries || metricNames.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingDictionaries
                        ? t("admin.metricLinksPage.metricNameLoading")
                        : t("admin.metricLinksPage.metricNamePlaceholder")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {metricNames.map((metricName) => (
                    <SelectItem key={metricName.id} value={String(metricName.id)}>
                      {formatDictionaryOption(metricName, inactiveSuffix)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="surface"
                size="sm"
                disabled={!metricNamesQuery.data?.hasPrevious}
                onClick={() =>
                  setMetricNamePage((current) => Math.max(DEFAULT_PAGE, current - 1))
                }
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="surface"
                size="sm"
                disabled={!metricNamesQuery.data?.hasNext}
                onClick={() => setMetricNamePage((current) => current + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        </CardContent>
        {dictionariesErrorMessage && (
          <CardContent className="pt-0">
            <p className="text-sm text-destructive">{dictionariesErrorMessage}</p>
          </CardContent>
        )}
      </Card>

      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.metricLinksPage.addLinkTitle")}</CardTitle>
          <CardDescription>
            {t("admin.metricLinksPage.addLinkDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                {t("common.search")}
              </div>
              <Input
                value={unitQuery}
                onChange={(event) => {
                  setUnitQuery(event.target.value);
                  setUnitPage(DEFAULT_PAGE);
                }}
                placeholder={t("admin.metricLinksPage.unitLabel")}
                className="max-w-xl"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="surface"
                size="sm"
                disabled={!metricUnitsQuery.data?.hasPrevious}
                onClick={() => setUnitPage((current) => Math.max(DEFAULT_PAGE, current - 1))}
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="surface"
                size="sm"
                disabled={!metricUnitsQuery.data?.hasNext}
                onClick={() => setUnitPage((current) => current + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4" />
                {t("admin.metricLinksPage.unitLabel")}
              </div>
              <Select
                value={selectedMetricUnitId != null ? String(selectedMetricUnitId) : ""}
                onValueChange={(value) => {
                  const nextUnit =
                    availableUnits.find((unit) => unit.id === Number(value)) ?? null;

                  setSelectedMetricUnit(nextUnit);
                }}
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
                        ? t("admin.metricLinksPage.unitPlaceholderSelectMetric")
                        : availableUnits.length === 0
                          ? t("admin.metricLinksPage.unitPlaceholderAllLinked")
                          : t("admin.metricLinksPage.unitPlaceholderSelect")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {formatDictionaryOption(unit, inactiveSuffix)}
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
              {isCreating
                ? t("admin.metricLinksPage.creatingLink")
                : t("admin.metricLinksPage.createLink")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("admin.metricLinksPage.currentLinksTitle")}</CardTitle>
            <CardDescription>
              {selectedMetricName
                ? t("admin.metricLinksPage.currentLinksDescriptionSelected", {
                    name: selectedMetricName.label,
                  })
                : t("admin.metricLinksPage.currentLinksDescriptionEmpty")}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full border-transparent px-3 py-1"
          >
            <Link2 className="mr-2 h-3.5 w-3.5" />
            {linkedUnits.length}
          </Badge>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>{t("admin.metricLinksPage.unitColumn")}</TableHead>
              <TableHead className="w-40">{t("admin.metricLinksPage.statusColumn")}</TableHead>
              <TableHead className="w-32 text-right">
                {t("admin.metricLinksPage.actionColumn")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedMetricNameId == null ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.metricLinksPage.noMetricSelected")}
                </TableCell>
              </TableRow>
            ) : isLoadingLinks ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.metricLinksPage.loadingLinks")}
                </TableCell>
              </TableRow>
            ) : linksErrorMessage ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-destructive">
                  {linksErrorMessage}
                </TableCell>
              </TableRow>
            ) : linkedUnitsWithMeta.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("admin.metricLinksPage.emptyLinks")}
                </TableCell>
              </TableRow>
            ) : (
              linkedUnitsWithMeta.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{unit.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.metricLinksPage.unitMeta")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        unit.dictionaryUnit == null
                          ? "rounded-full border-transparent bg-input text-muted-foreground"
                          : unit.dictionaryUnit.active
                            ? "rounded-full border-transparent bg-primary/10 text-primary"
                            : "rounded-full border-transparent bg-destructive/10 text-destructive"
                      }
                    >
                      {unit.dictionaryUnit == null
                        ? t("common.notSpecified")
                        : unit.dictionaryUnit.active
                          ? t("admin.metricLinksPage.activeStatus")
                          : t("admin.metricLinksPage.inactiveStatus")}
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
                      {t("admin.metricLinksPage.deleteConfirm")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AdminConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null);
          }
        }}
        title={t("admin.metricLinksPage.deleteTitle")}
        description={
          pendingDelete == null
            ? ""
            : t("admin.metricLinksPage.deleteDescription", {
                label: pendingDelete.label,
              })
        }
        confirmLabel={
          isDeleting
            ? t("common.deleting")
            : t("admin.metricLinksPage.deleteConfirm")
        }
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
