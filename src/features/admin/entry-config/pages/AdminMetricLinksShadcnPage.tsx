import { useEffect, useMemo, useState } from "react";
import { BookOpen, Link2, Plus, Ruler, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
import { getIntlLocale } from "@/shared/i18n/locale";
import { syncMetricUnitLinkCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import type { DictionaryResponse } from "@/shared/types/adminDictionary";
import type { MetricLinkResponse } from "@/shared/types/adminMetricLink";

export default function AdminMetricLinksShadcnPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
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

  function sortDictionaryItems(items: DictionaryResponse[]) {
    return [...items].sort((left, right) => {
      if (left.active !== right.active) {
        return left.active ? -1 : 1;
      }

      return left.label.localeCompare(right.label, locale);
    });
  }

  function formatDictionaryOption(item: DictionaryResponse) {
    return item.active
      ? item.label
      : `${item.label} (${t("admin.metricLinksPage.inactiveSuffix")})`;
  }

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
      toast.error(t("admin.metricLinksPage.dictionariesLoadError"));
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
      toast.error(t("admin.metricLinksPage.linksLoadError"));
    } finally {
      setIsLoadingLinks(false);
    }
  }

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
      await syncMetricUnitLinkCachesAfterAdminMutation(queryClient);
      setSelectedMetricUnitId(null);
      await loadLinks(selectedMetricNameId);
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
      await syncMetricUnitLinkCachesAfterAdminMutation(queryClient);
      setPendingDelete(null);
      await loadLinks(selectedMetricNameId);
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
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          {t("admin.metricLinksPage.badge")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.metricLinksPage.title")}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("admin.metricLinksPage.subtitle")}
        </p>
      </div>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.metricLinksPage.selectMetricTitle")}</CardTitle>
          <CardDescription>
            {t("admin.metricLinksPage.selectMetricDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {t("admin.metricLinksPage.metricNameLabel")}
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
                      ? t("admin.metricLinksPage.metricNameLoading")
                      : t("admin.metricLinksPage.metricNamePlaceholder")
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
            {t("admin.metricLinksPage.linksCount", {
              count: linkedUnits.length,
            })}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader>
          <CardTitle>{t("admin.metricLinksPage.addLinkTitle")}</CardTitle>
          <CardDescription>
            {t("admin.metricLinksPage.addLinkDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ruler className="h-4 w-4" />
              {t("admin.metricLinksPage.unitLabel")}
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
            {isCreating
              ? t("admin.metricLinksPage.creatingLink")
              : t("admin.metricLinksPage.createLink")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
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
                          unit.dictionaryUnit?.active === false
                            ? "rounded-full border-destructive/30 text-destructive"
                            : "rounded-full border-primary/30 text-primary"
                        }
                      >
                        {unit.dictionaryUnit?.active === false
                          ? t("admin.metricLinksPage.inactiveStatus")
                          : t("admin.metricLinksPage.activeStatus")}
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
        </CardContent>
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
