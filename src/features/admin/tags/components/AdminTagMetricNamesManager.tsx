import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Link2, Plus, Save, Search, Tags, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { adminTagMetricLinksApi } from "@/api/admin/adminTagMetricLinksApi";
import { getDictionaryByTypeAdmin } from "@/api/admin/dictionaryAdminApi";
import { getAllTags } from "@/api/tagApi";
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
import type { ApiResponse } from "@/shared/types/api";
import type { DictionaryResponse } from "@/shared/types/adminDictionary";
import type { AdminTagMetricLink } from "@/shared/types/adminTagMetricLink";
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

function normalizeMetricNameIds(metricNameIds: number[]) {
  return [...new Set(metricNameIds)].sort((left, right) => left - right);
}

function mapLinkMetricNameIds(links: AdminTagMetricLink[]) {
  return normalizeMetricNameIds(links.map((link) => link.metricNameId));
}

function areSelectionsEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function AdminTagMetricNamesManager() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.resolvedLanguage === "en" ? "en" : "ru");
  const [tagQuery, setTagQuery] = useState("");
  const [metricQuery, setMetricQuery] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [metricNames, setMetricNames] = useState<DictionaryResponse[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);
  const [initialMetricNameIds, setInitialMetricNameIds] = useState<number[]>([]);
  const [draftMetricNameIds, setDraftMetricNameIds] = useState<number[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingMetricNames, setIsLoadingMetricNames] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagsErrorMessage, setTagsErrorMessage] = useState<string | null>(null);
  const [metricNamesErrorMessage, setMetricNamesErrorMessage] = useState<string | null>(null);
  const [linksErrorMessage, setLinksErrorMessage] = useState<string | null>(null);
  const debouncedTagQuery = useDebouncedValue(tagQuery.trim(), 180);

  function sortTags(tags: Tag[]) {
    return [...tags].sort((left, right) => left.name.localeCompare(right.name, locale));
  }

  function sortMetricNames(items: DictionaryResponse[]) {
    return [...items].sort((left, right) => {
      if (left.active !== right.active) {
        return left.active ? -1 : 1;
      }

      const labelCompare = left.label.localeCompare(right.label, locale);
      return labelCompare || left.id - right.id;
    });
  }

  useEffect(() => {
    let isActive = true;

    async function loadTags() {
      try {
        setIsLoadingTags(true);
        setTagsErrorMessage(null);

        const data = await getAllTags(debouncedTagQuery);
        if (!isActive) {
          return;
        }

        setAvailableTags(sortTags(data));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAvailableTags([]);
        setTagsErrorMessage(
          extractApiErrorMessage(error, t("admin.tagMetricNames.tagsLoadError"))
        );
      } finally {
        if (isActive) {
          setIsLoadingTags(false);
        }
      }
    }

    void loadTags();

    return () => {
      isActive = false;
    };
  }, [debouncedTagQuery, locale, t]);

  useEffect(() => {
    let isActive = true;

    async function loadMetricNames() {
      try {
        setIsLoadingMetricNames(true);
        setMetricNamesErrorMessage(null);

        const data = await getDictionaryByTypeAdmin("METRIC_NAME");
        if (!isActive) {
          return;
        }

        setMetricNames(
          sortMetricNames(
            data.filter((item) => item.type === "METRIC_NAME")
          )
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMetricNames([]);
        setMetricNamesErrorMessage(
          extractApiErrorMessage(
            error,
            t("admin.tagMetricNames.metricNamesLoadError")
          )
        );
      } finally {
        if (isActive) {
          setIsLoadingMetricNames(false);
        }
      }
    }

    void loadMetricNames();

    return () => {
      isActive = false;
    };
  }, [locale, t]);

  useEffect(() => {
    if (selectedTagId == null) {
      setInitialMetricNameIds([]);
      setDraftMetricNameIds([]);
      setLinksErrorMessage(null);
      return;
    }

    const currentTagId = selectedTagId;
    let isActive = true;

    async function loadLinks() {
      try {
        setIsLoadingLinks(true);
        setLinksErrorMessage(null);

        const data = await adminTagMetricLinksApi.getTagMetricsByTagAdmin(
          currentTagId
        );

        if (!isActive) {
          return;
        }

        const nextMetricNameIds = mapLinkMetricNameIds(data);
        setInitialMetricNameIds(nextMetricNameIds);
        setDraftMetricNameIds(nextMetricNameIds);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setInitialMetricNameIds([]);
        setDraftMetricNameIds([]);
        setLinksErrorMessage(
          extractApiErrorMessage(error, t("admin.tagMetricNames.linksLoadError"))
        );
      } finally {
        if (isActive) {
          setIsLoadingLinks(false);
        }
      }
    }

    void loadLinks();

    return () => {
      isActive = false;
    };
  }, [selectedTagId, t]);

  const draftMetricNameSet = useMemo(
    () => new Set(draftMetricNameIds),
    [draftMetricNameIds]
  );

  const hasChanges = useMemo(
    () => !areSelectionsEqual(initialMetricNameIds, draftMetricNameIds),
    [draftMetricNameIds, initialMetricNameIds]
  );

  const filteredMetricNames = useMemo(() => {
    const normalizedQuery = metricQuery.trim().toLocaleLowerCase(locale);

    if (!normalizedQuery) {
      return metricNames;
    }

    return metricNames.filter((metricName) =>
      metricName.label.toLocaleLowerCase(locale).includes(normalizedQuery)
    );
  }, [locale, metricNames, metricQuery]);

  const selectedMetricNames = useMemo(
    () =>
      metricNames.filter((metricName) =>
        draftMetricNameSet.has(metricName.id)
      ),
    [draftMetricNameSet, metricNames]
  );

  function handleTagQueryChange(value: string) {
    setTagQuery(value);

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      setSelectedTagId(null);
      setSelectedTagName(null);
      setInitialMetricNameIds([]);
      setDraftMetricNameIds([]);
      setMetricQuery("");
      setLinksErrorMessage(null);
      return;
    }

    if (selectedTagName && selectedTagName.toLowerCase() !== normalized) {
      setSelectedTagId(null);
      setSelectedTagName(null);
      setInitialMetricNameIds([]);
      setDraftMetricNameIds([]);
      setMetricQuery("");
      setLinksErrorMessage(null);
    }
  }

  function handleSelectTag(value: string) {
    const nextTagId = Number(value);
    const nextTag = availableTags.find((tag) => tag.id === nextTagId) ?? null;

    setSelectedTagId(nextTagId);
    setSelectedTagName(nextTag?.name ?? null);
    setMetricQuery("");

    if (nextTag) {
      setTagQuery(nextTag.name);
    }
  }

  function toggleMetricName(metricNameId: number) {
    setDraftMetricNameIds((current) => {
      if (current.includes(metricNameId)) {
        return current.filter((currentId) => currentId !== metricNameId);
      }

      return normalizeMetricNameIds([...current, metricNameId]);
    });
  }

  function handleReset() {
    setDraftMetricNameIds(initialMetricNameIds);
  }

  async function handleSave() {
    if (selectedTagId == null || selectedTagName == null) {
      toast.error(t("admin.tagMetricNames.selectTagError"));
      return;
    }

    try {
      setIsSaving(true);
      setLinksErrorMessage(null);

      const data = await adminTagMetricLinksApi.replaceTagMetricsByTagAdmin(
        selectedTagId,
        { metricNameIds: draftMetricNameIds }
      );

      const nextMetricNameIds = mapLinkMetricNameIds(data);
      setInitialMetricNameIds(nextMetricNameIds);
      setDraftMetricNameIds(nextMetricNameIds);

      toast.success(
        t("admin.tagMetricNames.saveSuccess", { tagName: selectedTagName })
      );
    } catch (error) {
      setLinksErrorMessage(
        extractApiErrorMessage(error, t("admin.tagMetricNames.saveError"))
      );
    } finally {
      setIsSaving(false);
    }
  }

  const currentLinksTitle = t("admin.tagMetricNames.currentLinksTitle", {
    suffix: selectedTagName
      ? t("admin.tagMetricNames.currentLinksSuffix", { name: selectedTagName })
      : "",
  }).trim();

  return (
    <Card className="border border-border bg-surface">
      <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <CardTitle>{t("admin.tagMetricNames.title")}</CardTitle>
          <CardDescription>
            {t("admin.tagMetricNames.description")}
          </CardDescription>
        </div>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          <Link2 className="mr-2 h-3.5 w-3.5" />
          {t("admin.tagMetricNames.linksCount", {
            count: draftMetricNameIds.length,
          })}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              {t("admin.tagMetricNames.tagSearchLabel")}
            </div>
            <Input
              value={tagQuery}
              onChange={(event) => handleTagQueryChange(event.target.value)}
              placeholder={t("admin.tagMetricNames.tagSearchPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tags className="h-4 w-4" />
              {t("admin.tagMetricNames.tagLabel")}
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
                      ? t("admin.tagMetricNames.tagLoading")
                      : availableTags.length === 0
                        ? t("admin.tagMetricNames.tagEmpty")
                        : t("admin.tagMetricNames.tagPlaceholder")
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
              <BookOpen className="h-4 w-4" />
              {t("admin.tagMetricNames.metricSearchLabel")}
            </div>
            <Input
              value={metricQuery}
              onChange={(event) => setMetricQuery(event.target.value)}
              placeholder={t("admin.tagMetricNames.metricSearchPlaceholder")}
              disabled={isLoadingMetricNames || metricNames.length === 0}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="surface"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
            >
              {t("common.reset")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                selectedTagId == null ||
                isLoadingMetricNames ||
                isLoadingLinks ||
                metricNamesErrorMessage != null ||
                !hasChanges
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{currentLinksTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {t("admin.tagMetricNames.currentLinksDescription")}
              </p>
            </div>

            {hasChanges && (
              <Badge
                variant="outline"
                className="w-fit rounded-full border-amber-500/30 text-amber-600 dark:text-amber-300"
              >
                {t("admin.tagMetricNames.unsavedChanges")}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTagId == null ? (
              <p className="text-sm text-muted-foreground">
                {t("admin.tagMetricNames.selectTagHint")}
              </p>
            ) : isLoadingLinks ? (
              <p className="text-sm text-muted-foreground">
                {t("admin.tagMetricNames.loadingLinks")}
              </p>
            ) : linksErrorMessage ? (
              <p className="text-sm text-destructive">{linksErrorMessage}</p>
            ) : selectedMetricNames.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("admin.tagMetricNames.emptyCurrentLinks")}
              </p>
            ) : (
              selectedMetricNames.map((metricName) => (
                <Badge
                  key={metricName.id}
                  variant="outline"
                  className="rounded-full border-primary/30 text-primary"
                >
                  {metricName.label}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {hasChanges
              ? t("admin.tagMetricNames.saveHintDirty")
              : t("admin.tagMetricNames.saveHintClean")}
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.tagMetricNames.metricColumn")}</TableHead>
                <TableHead className="w-40">
                  {t("admin.tagMetricNames.statusColumn")}
                </TableHead>
                <TableHead className="w-40">
                  {t("admin.tagMetricNames.relationColumn")}
                </TableHead>
                <TableHead className="w-32 text-right">
                  {t("admin.tagMetricNames.actionColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTagId == null ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagMetricNames.selectTagHint")}
                  </TableCell>
                </TableRow>
              ) : isLoadingMetricNames ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagMetricNames.loadingMetricNames")}
                  </TableCell>
                </TableRow>
              ) : metricNamesErrorMessage ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-destructive">
                    {metricNamesErrorMessage}
                  </TableCell>
                </TableRow>
              ) : isLoadingLinks ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagMetricNames.loadingLinks")}
                  </TableCell>
                </TableRow>
              ) : linksErrorMessage ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-destructive">
                    {linksErrorMessage}
                  </TableCell>
                </TableRow>
              ) : metricNames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagMetricNames.emptyMetricNames")}
                  </TableCell>
                </TableRow>
              ) : filteredMetricNames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t("admin.tagMetricNames.emptySearch")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetricNames.map((metricName) => {
                  const isLinked = draftMetricNameSet.has(metricName.id);

                  return (
                    <TableRow key={metricName.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{metricName.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.tagMetricNames.metricMeta", {
                              id: String(metricName.id),
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            metricName.active
                              ? "rounded-full border-primary/30 text-primary"
                              : "rounded-full border-destructive/30 text-destructive"
                          }
                        >
                          {metricName.active
                            ? t("admin.tagMetricNames.activeStatus")
                            : t("admin.tagMetricNames.inactiveStatus")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isLinked
                              ? "rounded-full border-primary/30 text-primary"
                              : "rounded-full border-border/70 text-muted-foreground"
                          }
                        >
                          {isLinked
                            ? t("admin.tagMetricNames.linkedStatus")
                            : t("admin.tagMetricNames.unlinkedStatus")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={isLinked ? "surface" : undefined}
                          disabled={isSaving}
                          onClick={() => toggleMetricName(metricName.id)}
                        >
                          {isLinked ? (
                            <X className="mr-2 h-4 w-4" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          {isLinked
                            ? t("admin.tagMetricNames.removeAction")
                            : t("admin.tagMetricNames.addAction")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
