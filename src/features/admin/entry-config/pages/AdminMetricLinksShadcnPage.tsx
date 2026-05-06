import { useEffect, useMemo, useState } from "react";
import { BookOpen, Link2, Plus, Ruler, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { adminMetricLinksApi } from "@/api/admin/adminMetricLinksApi";
import { AdminConfirmationDialog } from "@/features/admin/components/AdminConfirmationDialog";
import { PaginatedDropdownSelect } from "@/shared/components/PaginatedDropdownSelect";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { getIntlLocale } from "@/shared/i18n/locale";
import {
  ENTRY_DROPDOWN_PAGE_LIMIT,
  ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS,
} from "@/shared/lib/entryDropdown";
import { syncMetricUnitLinkCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import {
  getAdminDictionaryByTypeQueryOptions,
  getAdminMetricLinksQueryOptions,
} from "@/shared/lib/queryOptions";
import type { PageResponse } from "@/shared/types/api";
import type {
  AdminDictionaryListResponse,
  DictionaryResponse,
} from "@/shared/types/adminDictionary";
import type { MetricLinkResponse } from "@/shared/types/adminMetricLink";

const DEFAULT_PAGE = 0;
const LINKED_UNITS_PAGE_LIMIT = 10;

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
  const [linkedUnitsPage, setLinkedUnitsPage] = useState(DEFAULT_PAGE);
  const [selectedMetricName, setSelectedMetricName] = useState<DictionaryResponse | null>(null);
  const [selectedMetricUnit, setSelectedMetricUnit] = useState<DictionaryResponse | null>(null);
  const [knownMetricUnits, setKnownMetricUnits] = useState<Record<number, DictionaryResponse>>(
    {}
  );
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MetricLinkResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedMetricNameQuery = useDebouncedValue(
    metricNameQuery,
    ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS
  );
  const debouncedUnitQuery = useDebouncedValue(
    unitQuery,
    ENTRY_DROPDOWN_SEARCH_DEBOUNCE_MS
  );
  const selectedMetricNameId = selectedMetricName?.id ?? null;
  const selectedMetricUnitId = selectedMetricUnit?.id ?? null;

  const metricNamesQuery = useQuery<AdminDictionaryListResponse, Error>(
    {
      ...getAdminDictionaryByTypeQueryOptions({
        type: "METRIC_NAME",
        page: metricNamePage,
        limit: ENTRY_DROPDOWN_PAGE_LIMIT,
        q: debouncedMetricNameQuery,
      }),
      placeholderData: undefined,
    }
  );
  const metricUnitsQuery = useQuery<AdminDictionaryListResponse, Error>(
    {
      ...getAdminDictionaryByTypeQueryOptions({
        type: "METRIC_UNIT",
        page: unitPage,
        limit: ENTRY_DROPDOWN_PAGE_LIMIT,
        q: debouncedUnitQuery,
      }),
      placeholderData: undefined,
    }
  );
  const linkedUnitsQueryOptions = getAdminMetricLinksQueryOptions({
    metricNameId: selectedMetricNameId ?? 0,
    page: linkedUnitsPage,
    limit: LINKED_UNITS_PAGE_LIMIT,
  });
  const {
    data: unitsPage,
    isPending: isLoadingLinks,
    error: linkedUnitsError,
  } = useQuery<PageResponse<MetricLinkResponse>, Error>({
    ...linkedUnitsQueryOptions,
    enabled: selectedMetricNameId != null,
  });

  const metricNameItems = metricNamesQuery.data?.items ?? [];
  const metricUnitItems = metricUnitsQuery.data?.items ?? [];
  const linkedUnits = unitsPage?.items ?? [];
  const linkedUnitsTotalElements = unitsPage?.totalElements ?? 0;
  const linkedUnitsCurrentPage = unitsPage?.page ?? linkedUnitsPage;
  const linkedUnitsTotalPages = unitsPage?.totalPages ?? 0;
  const hasLinkedUnitsNextPage = unitsPage?.hasNext ?? false;
  const hasLinkedUnitsPreviousPage = unitsPage?.hasPrevious ?? false;

  useEffect(() => {
    setKnownMetricUnits((current) => mergeDictionaryLookup(current, metricUnitItems));
  }, [metricUnitItems]);

  useEffect(() => {
    if (metricNameItems.length === 0 || selectedMetricName != null) {
      return;
    }

    setSelectedMetricName(sortDictionaryItems(metricNameItems, locale)[0] ?? null);
  }, [locale, metricNameItems, selectedMetricName]);

  const linkedUnitIds = useMemo(
    () => new Set(linkedUnits.map((unit) => unit.id)),
    [linkedUnits]
  );

  const metricNameOptions = useMemo(
    () => sortDictionaryItems(metricNameItems, locale),
    [locale, metricNameItems]
  );
  const metricNameDropdownItems = useMemo(
    () =>
      metricNameOptions.map((metricName) => ({
        id: metricName.id,
        label: formatDictionaryOption(metricName, inactiveSuffix),
      })),
    [inactiveSuffix, metricNameOptions]
  );
  const availableUnitOptions = useMemo(
    () =>
      sortDictionaryItems(
        metricUnitItems.filter((unit) => !linkedUnitIds.has(unit.id)),
        locale
      ),
    [linkedUnitIds, locale, metricUnitItems]
  );
  const unitDropdownItems = useMemo(
    () =>
      availableUnitOptions.map((unit) => ({
        id: unit.id,
        label: formatDictionaryOption(unit, inactiveSuffix),
      })),
    [availableUnitOptions, inactiveSuffix]
  );
  const selectedMetricNameLabel =
    selectedMetricName == null
      ? null
      : formatDictionaryOption(selectedMetricName, inactiveSuffix);
  const selectedMetricUnitLabel =
    selectedMetricUnit == null
      ? null
      : formatDictionaryOption(selectedMetricUnit, inactiveSuffix);

  const linkedUnitsWithMeta = useMemo(
    () =>
      linkedUnits.map((linkedUnit) => ({
        ...linkedUnit,
        dictionaryUnit: knownMetricUnits[linkedUnit.id] ?? null,
      })),
    [knownMetricUnits, linkedUnits]
  );

  const linksErrorMessage = linkedUnitsError?.message ?? null;
  const isLinkedUnitsInteractionDisabled =
    selectedMetricNameId == null || isLoadingLinks || linksErrorMessage != null;
  const linkedUnitsPaginationLabel =
    linkedUnitsTotalPages === 0
      ? t("admin.metricLinksPage.noPages")
      : t("admin.metricLinksPage.pageLabel", {
          page: String(linkedUnitsCurrentPage + 1),
          totalPages: String(linkedUnitsTotalPages),
        });

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
      await adminMetricLinksApi.createMetricLink({
        metricNameId: selectedMetricNameId,
        metricUnitId: selectedMetricUnitId,
      });
      await queryClient.invalidateQueries({
        queryKey: linkedUnitsQueryOptions.queryKey,
        exact: true,
      });
      await syncMetricUnitLinkCachesAfterAdminMutation(
        queryClient,
        selectedMetricNameId
      );
      setSelectedMetricUnit(null);
      setUnitQuery("");
      setUnitPage(DEFAULT_PAGE);
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
      const shouldMoveToPreviousPage =
        linkedUnits.length === 1 && linkedUnitsPage > DEFAULT_PAGE;
      const nextLinkedUnitsPage = shouldMoveToPreviousPage
        ? linkedUnitsPage - 1
        : linkedUnitsPage;
      await adminMetricLinksApi.deleteMetricLink(
        selectedMetricNameId,
        pendingDelete.id
      );
      await queryClient.invalidateQueries({
        queryKey: linkedUnitsQueryOptions.queryKey,
        exact: true,
      });
      if (shouldMoveToPreviousPage) {
        await queryClient.invalidateQueries({
          queryKey: getAdminMetricLinksQueryOptions({
            metricNameId: selectedMetricNameId,
            page: nextLinkedUnitsPage,
            limit: LINKED_UNITS_PAGE_LIMIT,
          }).queryKey,
          exact: true,
        });
      }
      if (shouldMoveToPreviousPage) {
        setLinkedUnitsPage((current) => Math.max(DEFAULT_PAGE, current - 1));
      }
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
                <BookOpen className="h-4 w-4" />
                {t("admin.metricLinksPage.metricNameLabel")}
              </div>
              <PaginatedDropdownSelect
                value={selectedMetricNameId}
                selectedLabel={selectedMetricNameLabel}
                placeholder={t("admin.metricLinksPage.metricNamePlaceholder")}
                searchValue={metricNameQuery}
                items={metricNameDropdownItems}
                page={metricNamesQuery.data?.page ?? metricNamePage}
                totalPages={metricNamesQuery.data?.totalPages ?? 0}
                hasNext={metricNamesQuery.data?.hasNext ?? false}
                hasPrevious={metricNamesQuery.data?.hasPrevious ?? false}
                isLoading={metricNamesQuery.isPending}
                isError={metricNamesQuery.isError}
                searchMode="trigger"
                loadingLabel={t("admin.metricLinksPage.metricNameLoading")}
                emptyLabel="No results"
                errorLabel={t("common.error")}
                onSearchChange={(nextValue) => {
                  setMetricNameQuery(nextValue);
                  setMetricNamePage(DEFAULT_PAGE);
                }}
                onPageChange={setMetricNamePage}
                onSelect={(selectedOption) => {
                  const nextMetricName =
                    metricNameOptions.find((metricName) => metricName.id === selectedOption.id) ??
                    null;

                  setSelectedMetricName(nextMetricName);
                  setMetricNameQuery("");
                  setMetricNamePage(DEFAULT_PAGE);
                  setSelectedMetricUnit(null);
                  setUnitQuery("");
                  setUnitPage(DEFAULT_PAGE);
                  setLinkedUnitsPage(DEFAULT_PAGE);
                  setPendingDelete(null);
                }}
              />
            </div>

            <Badge
              variant="outline"
              className="w-fit rounded-full border-transparent px-3 py-1"
            >
              {t("admin.metricLinksPage.linksCount", {
                count: linkedUnitsTotalElements,
              })}
            </Badge>
          </div>
        </CardContent>
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
                <Ruler className="h-4 w-4" />
                {t("admin.metricLinksPage.unitLabel")}
              </div>
              <PaginatedDropdownSelect
                value={selectedMetricUnitId}
                selectedLabel={selectedMetricUnitLabel}
                placeholder={
                  selectedMetricNameId == null
                    ? t("admin.metricLinksPage.unitPlaceholderSelectMetric")
                    : t("admin.metricLinksPage.unitPlaceholderSelect")
                }
                searchValue={unitQuery}
                items={unitDropdownItems}
                page={metricUnitsQuery.data?.page ?? unitPage}
                totalPages={metricUnitsQuery.data?.totalPages ?? 0}
                hasNext={metricUnitsQuery.data?.hasNext ?? false}
                hasPrevious={metricUnitsQuery.data?.hasPrevious ?? false}
                isLoading={metricUnitsQuery.isPending}
                isError={metricUnitsQuery.isError}
                disabled={isLinkedUnitsInteractionDisabled}
                searchMode="trigger"
                loadingLabel={t("common.loading")}
                emptyLabel={
                  unitQuery.trim().length > 0
                    ? "No results"
                    : t("admin.metricLinksPage.unitPlaceholderAllLinked")
                }
                errorLabel={t("common.error")}
                triggerTitle={
                  selectedMetricNameId == null
                    ? t("admin.metricLinksPage.unitPlaceholderSelectMetric")
                    : undefined
                }
                onSearchChange={(nextValue) => {
                  setUnitQuery(nextValue);
                  setUnitPage(DEFAULT_PAGE);
                }}
                onPageChange={setUnitPage}
                onSelect={(selectedOption) => {
                  const nextUnit =
                    availableUnitOptions.find((unit) => unit.id === selectedOption.id) ?? null;

                  setSelectedMetricUnit(nextUnit);
                  setUnitQuery("");
                  setUnitPage(DEFAULT_PAGE);
                }}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={
                isCreating ||
                isLinkedUnitsInteractionDisabled ||
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
            {linkedUnitsTotalElements}
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
        {selectedMetricNameId != null && (
          <CardContent className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {linkedUnitsPaginationLabel}
            </p>
            <div className="flex gap-2">
              <Button
                variant="surface"
                size="sm"
                disabled={!hasLinkedUnitsPreviousPage || isDeleting}
                onClick={() =>
                  setLinkedUnitsPage((current) => Math.max(DEFAULT_PAGE, current - 1))
                }
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="surface"
                size="sm"
                disabled={!hasLinkedUnitsNextPage || isDeleting}
                onClick={() => setLinkedUnitsPage((current) => current + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          </CardContent>
        )}
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
