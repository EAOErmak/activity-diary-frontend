import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Link2, Plus, Search, Tags, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { adminTagChartTypesApi } from "@/api/admin/adminTagChartTypesApi";
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
import { syncTagChartTypeCachesAfterAdminMutation } from "@/shared/lib/adminCacheSync";
import { adminKeys } from "@/shared/lib/queryKeys";
import {
  getAdminTagChartTypesQueryOptions,
  getTagListQueryOptions,
} from "@/shared/lib/queryOptions";
import type { ApiResponse } from "@/shared/types/api";
import {
  ALL_CHART_TYPES,
  getChartTypeLabel,
  type ChartType,
} from "@/shared/types/analytics";
import type { AdminTagChartTypeLink } from "@/shared/types/adminTagChartType";
import type { Tag } from "@/shared/types/tag";

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const apiMessage = error.response?.data?.message?.trim();

    if (apiMessage) {
      return apiMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function areChartTypeListsEqual(left: ChartType[], right: ChartType[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

type AdminTagChartTypesManagerProps = {
  updatedTag?: Tag | null;
};

export function AdminTagChartTypesManager({
  updatedTag = null,
}: AdminTagChartTypesManagerProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<ChartType | null>(null);
  const [linkedChartTypeIds, setLinkedChartTypeIds] = useState<ChartType[]>([]);
  const [linkedChartTypesTagId, setLinkedChartTypesTagId] = useState<number | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mutationErrorMessage, setMutationErrorMessage] = useState<string | null>(
    null
  );
  const [pendingDelete, setPendingDelete] = useState<AdminTagChartTypeLink | null>(
    null
  );
  const debouncedTagQuery = useDebouncedValue(tagQuery.trim(), 180);

  function sortTags(tags: Tag[]) {
    return [...tags].sort((left, right) => left.name.localeCompare(right.name, locale));
  }

  function sortChartTypes(chartTypes: ChartType[]) {
    return [...chartTypes].sort((left, right) => {
      const labelCompare = getChartTypeLabel(left).localeCompare(
        getChartTypeLabel(right),
        locale
      );

      return labelCompare || left.localeCompare(right);
    });
  }

  function sortTagChartTypeLinks(linksToSort: AdminTagChartTypeLink[]) {
    return [...linksToSort].sort((left, right) => {
      const labelCompare = getChartTypeLabel(left.chartType).localeCompare(
        getChartTypeLabel(right.chartType),
        locale
      );

      return labelCompare || left.chartType.localeCompare(right.chartType);
    });
  }

  function mapLinkChartTypeIds(linksToMap: AdminTagChartTypeLink[]) {
    return sortChartTypes([...new Set(linksToMap.map((link) => link.chartType))]);
  }

  function debugState(event: string, payload?: Record<string, unknown>) {
    if (!import.meta.env.DEV) {
      return;
    }

    console.debug("[AdminTagChartTypesManager]", event, payload);
  }

  function resetSelectedChartType(reason: string) {
    setSelectedChartType((current) => {
      if (current != null) {
        debugState("selectedChartType:reset", {
          reason,
          previousChartType: current,
        });
      }

      return null;
    });
  }

  const tagsQuery = useQuery<Tag[], Error>(getTagListQueryOptions(debouncedTagQuery));
  const linksQuery = useQuery<AdminTagChartTypeLink[], Error>({
    ...getAdminTagChartTypesQueryOptions(selectedTagId ?? 0),
    enabled: selectedTagId != null,
  });

  const availableTags = useMemo(() => {
    let tags = sortTags(tagsQuery.data ?? []);

    if (updatedTag != null && tags.some((tag) => tag.id === updatedTag.id)) {
      tags = sortTags(
        tags.map((tag) => (tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag))
      );
    }

    // Keep the selected tag available in the Select even while the search field
    // is filtering to a different term or refetching a new option list.
    if (
      selectedTagId != null &&
      selectedTagName != null &&
      !tags.some((tag) => tag.id === selectedTagId)
    ) {
      tags = sortTags([...tags, { id: selectedTagId, name: selectedTagName }]);
    }

    return tags;
  }, [locale, selectedTagId, selectedTagName, tagsQuery.data, updatedTag]);

  const links = useMemo(
    () =>
      sortTagChartTypeLinks(
        linkedChartTypesTagId === selectedTagId
          ? linkedChartTypeIds.map((chartType) => ({
              tagId: selectedTagId ?? 0,
              chartType,
            }))
          : []
      ),
    [linkedChartTypeIds, linkedChartTypesTagId, locale, selectedTagId]
  );
  const isLoadingTags = tagsQuery.isPending;
  const isLoadingLinks = selectedTagId != null && linksQuery.isPending;
  const tagsErrorMessage = tagsQuery.error?.message ?? null;
  const linksErrorMessage = mutationErrorMessage ?? linksQuery.error?.message ?? null;

  useEffect(() => {
    if (updatedTag == null) {
      return;
    }

    if (selectedTagId === updatedTag.id) {
      debugState("selectedTag:update", {
        reason: "updatedTag-prop",
        tagId: updatedTag.id,
        tagName: updatedTag.name,
      });
      setSelectedTagName(updatedTag.name);
      setTagQuery(updatedTag.name);
    }
  }, [selectedTagId, updatedTag]);

  useEffect(() => {
    if (selectedTagId == null) {
      setLinkedChartTypesTagId(null);
      setLinkedChartTypeIds([]);
      resetSelectedChartType("selectedTag-cleared");
      setMutationErrorMessage(null);
    }
  }, [selectedTagId]);

  useEffect(() => {
    if (selectedTagId == null || linksQuery.data == null) {
      return;
    }

    const nextLinkedChartTypeIds = mapLinkChartTypeIds(linksQuery.data);

    setLinkedChartTypesTagId(selectedTagId);
    setLinkedChartTypeIds((current) =>
      areChartTypeListsEqual(current, nextLinkedChartTypeIds)
        ? current
        : nextLinkedChartTypeIds
    );
    debugState("linkedChartTypes:loaded", {
      tagId: selectedTagId,
      chartTypes: nextLinkedChartTypeIds,
      source: "linksQuery.data",
    });
  }, [linksQuery.data, selectedTagId]);

  const activeLinkedChartTypes = useMemo(
    () => (linkedChartTypesTagId === selectedTagId ? linkedChartTypeIds : []),
    [linkedChartTypeIds, linkedChartTypesTagId, selectedTagId]
  );

  const availableChartTypes = useMemo(
    () =>
      sortChartTypes(
        ALL_CHART_TYPES.filter(
          (chartType) => !activeLinkedChartTypes.includes(chartType)
        )
      ),
    [activeLinkedChartTypes, locale]
  );

  useEffect(() => {
    setSelectedChartType((current) => {
      if (current == null) {
        return current;
      }

      if (availableChartTypes.includes(current)) {
        return current;
      }

      debugState("selectedChartType:reset", {
        reason: "availableChartTypes-updated",
        previousChartType: current,
      });
      return null;
    });
  }, [availableChartTypes]);

  function handleTagQueryChange(value: string) {
    setTagQuery(value);

    if (value.trim()) {
      return;
    }

    if (selectedTagId != null || selectedTagName != null) {
      debugState("selectedTag:clear", {
        reason: "tag-search-cleared",
        tagId: selectedTagId,
        tagName: selectedTagName,
      });
    }

    setSelectedTagId(null);
    setSelectedTagName(null);
    setLinkedChartTypesTagId(null);
    setLinkedChartTypeIds([]);
    resetSelectedChartType("tag-search-cleared");
    setMutationErrorMessage(null);
  }

  function handleSelectTag(value: string) {
    const nextTagId = Number(value);
    const nextTag = availableTags.find((tag) => tag.id === nextTagId) ?? null;

    if (nextTag == null) {
      debugState("selectedTag:clear", {
        reason: "tag-select-missing-option",
        rawValue: value,
      });
      setSelectedTagId(null);
      setSelectedTagName(null);
      setLinkedChartTypesTagId(null);
      setLinkedChartTypeIds([]);
      resetSelectedChartType("tag-select-missing-option");
      setMutationErrorMessage(null);
      return;
    }

    debugState("selectedTag:set", {
      reason: "tag-select-value-change",
      tagId: nextTag.id,
      tagName: nextTag.name,
    });
    setSelectedTagId(nextTagId);
    setSelectedTagName(nextTag.name);
    resetSelectedChartType("tag-select-value-change");
    setMutationErrorMessage(null);
    setTagQuery(nextTag.name);
  }

  async function handleCreate() {
    if (selectedTagId == null || selectedTagName == null) {
      toast.error(t("admin.tagChartTypes.selectTagError"));
      return;
    }

    if (selectedChartType == null) {
      toast.error(t("admin.tagChartTypes.selectChartTypeError"));
      return;
    }

    try {
      setIsCreating(true);
      setMutationErrorMessage(null);

      const createdLink = await adminTagChartTypesApi.createTagChartTypeLink({
        tagId: selectedTagId,
        chartType: selectedChartType,
      });

      queryClient.setQueryData<AdminTagChartTypeLink[]>(
        adminKeys.tagChartTypesByTag(selectedTagId),
        (current = []) => sortTagChartTypeLinks([...current, createdLink])
      );
      setLinkedChartTypesTagId(selectedTagId);
      setLinkedChartTypeIds((current) => {
        const nextLinkedChartTypeIds = sortChartTypes([
          ...current,
          createdLink.chartType,
        ]);

        return areChartTypeListsEqual(current, nextLinkedChartTypeIds)
          ? current
          : nextLinkedChartTypeIds;
      });
      await syncTagChartTypeCachesAfterAdminMutation(queryClient, selectedTagId);
      resetSelectedChartType("create-link-success");
      toast.success(
        t("admin.tagChartTypes.linkCreated", {
          chartType: getChartTypeLabel(selectedChartType),
          tagName: selectedTagName,
        })
      );
    } catch (error) {
      setMutationErrorMessage(
        extractApiErrorMessage(error, t("admin.tagChartTypes.linksLoadError"))
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete() {
    if (selectedTagId == null || pendingDelete == null) {
      return;
    }

    try {
      setIsDeleting(true);
      setMutationErrorMessage(null);
      await adminTagChartTypesApi.deleteTagChartTypeLink(
        selectedTagId,
        pendingDelete.chartType
      );
      queryClient.setQueryData<AdminTagChartTypeLink[]>(
        adminKeys.tagChartTypesByTag(selectedTagId),
        (current = []) =>
          current.filter((link) => link.chartType !== pendingDelete.chartType)
      );
      setLinkedChartTypesTagId(selectedTagId);
      setLinkedChartTypeIds((current) =>
        current.filter((chartType) => chartType !== pendingDelete.chartType)
      );
      await syncTagChartTypeCachesAfterAdminMutation(queryClient, selectedTagId);
      const deletedChartType = pendingDelete.chartType;
      setPendingDelete(null);
      toast.success(
        t("admin.tagChartTypes.linkDeleted", {
          chartType: getChartTypeLabel(deletedChartType),
        })
      );
    } catch (error) {
      setMutationErrorMessage(
        extractApiErrorMessage(error, t("admin.tagChartTypes.linksLoadError"))
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const currentLinksTitle = t("admin.tagChartTypes.currentLinksTitle", {
    suffix: selectedTagName
      ? t("admin.tagChartTypes.currentLinksSuffix", { name: selectedTagName })
      : "",
  }).trim();

  return (
    <Card className="border border-border bg-surface">
      <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <CardTitle>{t("admin.tagChartTypes.title")}</CardTitle>
          <CardDescription>
            {t("admin.tagChartTypes.description")}
          </CardDescription>
        </div>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          <Link2 className="mr-2 h-3.5 w-3.5" />
          {t("admin.tagChartTypes.linksCount", { count: links.length })}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              {t("admin.tagChartTypes.tagSearchLabel")}
            </div>
            <Input
              value={tagQuery}
              onChange={(event) => handleTagQueryChange(event.target.value)}
              placeholder={t("admin.tagChartTypes.tagSearchPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tags className="h-4 w-4" />
              {t("admin.tagChartTypes.tagLabel")}
            </div>
            <Select
              value={selectedTagId != null ? String(selectedTagId) : ""}
              onValueChange={handleSelectTag}
              disabled={availableTags.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingTags && availableTags.length === 0
                      ? t("admin.tagChartTypes.tagLoading")
                      : availableTags.length === 0
                        ? t("admin.tagChartTypes.tagEmpty")
                        : t("admin.tagChartTypes.tagPlaceholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.id} value={String(tag.id)}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {tagsErrorMessage && (
          <p className="text-sm text-destructive">{tagsErrorMessage}</p>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              {t("admin.tagChartTypes.chartTypeLabel")}
            </div>
            <Select
              value={selectedChartType ?? ""}
              onValueChange={(value) => setSelectedChartType(value || null)}
              disabled={
                selectedTagId == null ||
                isLoadingLinks ||
                availableChartTypes.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedTagId == null
                      ? t("admin.tagChartTypes.chartTypePlaceholderSelectTag")
                      : isLoadingLinks
                        ? t("admin.tagChartTypes.chartTypePlaceholderLoading")
                        : availableChartTypes.length === 0
                          ? t("admin.tagChartTypes.chartTypePlaceholderAllLinked")
                          : t("admin.tagChartTypes.chartTypePlaceholderSelect")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableChartTypes.map((chartType) => (
                  <SelectItem key={chartType} value={chartType}>
                    {getChartTypeLabel(chartType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              isCreating ||
              selectedTagId == null ||
              selectedChartType == null
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating
              ? t("admin.tagChartTypes.creatingLink")
              : t("admin.tagChartTypes.createLink")}
          </Button>
        </div>

        {selectedTagId != null &&
          !isLoadingLinks &&
          !linksErrorMessage &&
          availableChartTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("admin.tagChartTypes.allLinkedForTag")}
            </p>
          )}

        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{currentLinksTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {t("admin.tagChartTypes.currentLinksDescription")}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.tagChartTypes.chartTypeColumn")}</TableHead>
                <TableHead className="w-[220px]">
                  {t("admin.tagChartTypes.enumColumn")}
                </TableHead>
                <TableHead className="w-32 text-right">
                  {t("admin.tagChartTypes.actionColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTagId == null ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagChartTypes.selectTagHint")}
                  </TableCell>
                </TableRow>
              ) : isLoadingLinks ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagChartTypes.loadingLinks")}
                  </TableCell>
                </TableRow>
              ) : linksErrorMessage ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-destructive">
                    {linksErrorMessage}
                  </TableCell>
                </TableRow>
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagChartTypes.emptyLinks")}
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={`${link.tagId}:${link.chartType}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{getChartTypeLabel(link.chartType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tagChartTypes.backendRuleLabel")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {link.chartType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="surface"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setPendingDelete(link)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("common.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AdminConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null);
          }
        }}
        title={t("admin.tagChartTypes.deleteTitle")}
        description={
          pendingDelete == null
            ? ""
            : t("admin.tagChartTypes.deleteDescription", {
                chartType: getChartTypeLabel(pendingDelete.chartType),
              })
        }
        confirmLabel={
          isDeleting
            ? t("common.deleting")
            : t("admin.tagChartTypes.deleteConfirm")
        }
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDelete}
      />
    </Card>
  );
}
