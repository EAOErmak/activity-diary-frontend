import axios from "axios";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { BarChart3, Link2, Plus, Search, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { adminTagChartTypesApi } from "@/api/admin/adminTagChartTypesApi";
import { getAllTags } from "@/api/tagApi";
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
import type { ApiResponse } from "@/shared/types/api";
import {
  ALL_CHART_TYPES,
  getChartTypeLabel,
  type ChartType,
} from "@/shared/types/analytics";
import type { AdminTagChartTypeLink } from "@/shared/types/adminTagChartType";
import type { Tag } from "@/shared/types/tag";

function sortTags(tags: Tag[]) {
  return [...tags].sort((left, right) => left.name.localeCompare(right.name, "ru"));
}

function sortChartTypes(chartTypes: ChartType[]) {
  return [...chartTypes].sort((left, right) => {
    const labelCompare = getChartTypeLabel(left).localeCompare(
      getChartTypeLabel(right),
      "ru"
    );

    return labelCompare || left.localeCompare(right);
  });
}

function sortTagChartTypeLinks(links: AdminTagChartTypeLink[]) {
  return [...links].sort((left, right) => {
    const labelCompare = getChartTypeLabel(left.chartType).localeCompare(
      getChartTypeLabel(right.chartType),
      "ru"
    );

    return labelCompare || left.chartType.localeCompare(right.chartType);
  });
}

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

export function AdminTagChartTypesManager() {
  const [tagQuery, setTagQuery] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);
  const [links, setLinks] = useState<AdminTagChartTypeLink[]>([]);
  const [selectedChartType, setSelectedChartType] = useState<ChartType | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tagsErrorMessage, setTagsErrorMessage] = useState<string | null>(null);
  const [linksErrorMessage, setLinksErrorMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminTagChartTypeLink | null>(null);
  const deferredTagQuery = useDeferredValue(tagQuery);

  useEffect(() => {
    let isActive = true;

    async function loadTags() {
      try {
        setIsLoadingTags(true);
        setTagsErrorMessage(null);

        const data = await getAllTags(deferredTagQuery);
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
          extractApiErrorMessage(error, "Не удалось загрузить список тегов.")
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
  }, [deferredTagQuery]);

  useEffect(() => {
    if (selectedTagId == null) {
      setLinks([]);
      setLinksErrorMessage(null);
      return;
    }

    const currentTagId = selectedTagId;
    let isActive = true;

    async function loadLinks() {
      try {
        setIsLoadingLinks(true);
        setLinksErrorMessage(null);

        const data = await adminTagChartTypesApi.getTagChartTypesByTagAdmin(
          currentTagId
        );

        if (!isActive) {
          return;
        }

        setLinks(sortTagChartTypeLinks(data));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLinks([]);
        setLinksErrorMessage(
          extractApiErrorMessage(error, "Не удалось загрузить связи tag ↔ chart type.")
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
  }, [selectedTagId]);

  const linkedChartTypes = useMemo(
    () => new Set(links.map((link) => link.chartType)),
    [links]
  );

  const availableChartTypes = useMemo(
    () =>
      sortChartTypes(
        ALL_CHART_TYPES.filter((chartType) => !linkedChartTypes.has(chartType))
      ),
    [linkedChartTypes]
  );

  useEffect(() => {
    setSelectedChartType((current) => {
      if (current == null) {
        return current;
      }

      return availableChartTypes.includes(current) ? current : null;
    });
  }, [availableChartTypes]);

  async function reloadLinks(tagId: number) {
    try {
      setIsLoadingLinks(true);
      setLinksErrorMessage(null);
      const data = await adminTagChartTypesApi.getTagChartTypesByTagAdmin(tagId);
      setLinks(sortTagChartTypeLinks(data));
    } catch (error) {
      setLinks([]);
      setLinksErrorMessage(
        extractApiErrorMessage(error, "Не удалось загрузить связи tag ↔ chart type.")
      );
    } finally {
      setIsLoadingLinks(false);
    }
  }

  function handleTagQueryChange(value: string) {
    setTagQuery(value);

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      setSelectedTagId(null);
      setSelectedTagName(null);
      setLinks([]);
      setSelectedChartType(null);
      setLinksErrorMessage(null);
      return;
    }

    if (selectedTagName && selectedTagName.toLowerCase() !== normalized) {
      setSelectedTagId(null);
      setSelectedTagName(null);
      setLinks([]);
      setSelectedChartType(null);
      setLinksErrorMessage(null);
    }
  }

  function handleSelectTag(value: string) {
    const nextTagId = Number(value);
    const nextTag = availableTags.find((tag) => tag.id === nextTagId) ?? null;

    setSelectedTagId(nextTagId);
    setSelectedTagName(nextTag?.name ?? null);
    setSelectedChartType(null);

    if (nextTag) {
      setTagQuery(nextTag.name);
    }
  }

  async function handleCreate() {
    if (selectedTagId == null || selectedTagName == null) {
      toast.error("Сначала выберите тег.");
      return;
    }

    if (selectedChartType == null) {
      toast.error("Выберите тип графика.");
      return;
    }

    try {
      setIsCreating(true);
      await adminTagChartTypesApi.createTagChartTypeLink({
        tagId: selectedTagId,
        chartType: selectedChartType,
      });
      setSelectedChartType(null);
      await reloadLinks(selectedTagId);
      toast.success(
        `Тип графика "${getChartTypeLabel(selectedChartType)}" добавлен для тега "${selectedTagName}".`
      );
    } catch (error) {
      setLinksErrorMessage(
        extractApiErrorMessage(error, "Не удалось создать связь tag ↔ chart type.")
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
      await adminTagChartTypesApi.deleteTagChartTypeLink(
        selectedTagId,
        pendingDelete.chartType
      );
      const deletedChartType = pendingDelete.chartType;
      setPendingDelete(null);
      await reloadLinks(selectedTagId);
      toast.success(`Связь "${getChartTypeLabel(deletedChartType)}" удалена.`);
    } catch (error) {
      setLinksErrorMessage(
        extractApiErrorMessage(error, "Не удалось удалить связь tag ↔ chart type.")
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border border-border bg-surface">
      <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <CardTitle>Разрешенные типы графиков</CardTitle>
          <CardDescription>
            Настройте, какие chart types доступны для выбранного тега в аналитике.
          </CardDescription>
        </div>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
          <Link2 className="mr-2 h-3.5 w-3.5" />
          Связей: {links.length}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              Поиск тега
            </div>
            <Input
              value={tagQuery}
              onChange={(event) => handleTagQueryChange(event.target.value)}
              placeholder="Начните вводить название тега..."
              disabled={isLoadingTags}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tags className="h-4 w-4" />
              Тег
            </div>
            <Select
              value={selectedTagId != null ? String(selectedTagId) : ""}
              onValueChange={handleSelectTag}
              disabled={isLoadingTags || availableTags.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingTags
                      ? "Загрузка тегов..."
                      : availableTags.length === 0
                        ? "Теги не найдены"
                        : "Выберите тег"
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

        {!tagsErrorMessage && !isLoadingTags && availableTags.length === 0 && (
          <p className="text-sm text-muted-foreground">
            По этому запросу теги не найдены.
          </p>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Chart type
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
                      ? "Сначала выберите тег"
                      : isLoadingLinks
                        ? "Загрузка связей..."
                        : availableChartTypes.length === 0
                          ? "Все типы уже привязаны"
                          : "Выберите тип графика"
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
            {isCreating ? "Добавление..." : "Добавить связь"}
          </Button>
        </div>

        {selectedTagId != null &&
          !isLoadingLinks &&
          !linksErrorMessage &&
          availableChartTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Для выбранного тега уже привязаны все доступные типы графиков.
            </p>
          )}

        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              Текущие связи{selectedTagName ? ` для "${selectedTagName}"` : ""}
            </h3>
            <p className="text-sm text-muted-foreground">
              Просмотр и удаление разрешенных chart types для выбранного тега.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chart type</TableHead>
                <TableHead className="w-[220px]">Enum</TableHead>
                <TableHead className="w-32 text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTagId == null ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Выберите тег, чтобы управлять доступными типами графиков.
                  </TableCell>
                </TableRow>
              ) : isLoadingLinks ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Загрузка связей...
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
                    Для этого тега пока нет разрешенных типов графиков.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={`${link.tagId}:${link.chartType}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{getChartTypeLabel(link.chartType)}</p>
                        <p className="text-sm text-muted-foreground">
                          Backend analytics availability rule
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
                        Удалить
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
        title="Удалить связь?"
        description={
          pendingDelete == null
            ? ""
            : `Тип графика "${getChartTypeLabel(pendingDelete.chartType)}" больше не будет доступен для выбранного тега.`
        }
        confirmLabel={isDeleting ? "Удаление..." : "Удалить связь"}
        loading={isDeleting}
        tone="danger"
        onConfirm={handleDelete}
      />
    </Card>
  );
}
