import { useEffect, useState } from "react";
import { getCategory, getSubCategoryByParent } from "@/api/dictionaryApi";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { format } from "date-fns";

type DictItem = { id: number; name: string };

type Props = {
  selectedCategoryIds: number[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<number[]>>;

  selectedSubCategoryIds: number[];
  setSelectedSubCategoryIds: React.Dispatch<React.SetStateAction<number[]>>;

  from: string;
  to: string;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;

  mode: "time" | "sequence";
  setMode: (v: "time" | "sequence") => void;
};

export default function AnalyticsFilters({
  selectedCategoryIds,
  setSelectedCategoryIds,
  selectedSubCategoryIds: selectedSubCategoryIds,
  setSelectedSubCategoryIds: setSelectedSubCategoryIds,
  from,
  to,
  setFrom,
  setTo,
  mode,
  setMode,
}: Props) {
  const [categories, setCategories] = useState<DictItem[]>([]);
  const [subCategories, setSubCategories] = useState<DictItem[]>([]);

  const [fromDate, setFromDate] = useState(
    from ? new Date(from) : new Date()
  );
  const [toDate, setToDate] = useState(
    to ? new Date(to) : new Date()
  );

  // ✅ загрузка категорий
  useEffect(() => {
    getCategory().then(setCategories);
  }, []);

  // ✅ загрузка SUB_CATEGORY для всех выбранных категорий
  useEffect(() => {
    async function loadSubCategories() {
      const map = new Map<number, DictItem>();

      for (const id of selectedCategoryIds) {
        const data = await getSubCategoryByParent(id);
        data.forEach((item) => {
          map.set(item.id, item); // ✅ перезапись убирает дубли
        });
      }

      setSubCategories(Array.from(map.values()));
      setSelectedSubCategoryIds([]);
    }

    if (selectedCategoryIds.length > 0) {
        loadSubCategories();
    } else {
      // ✅ ВАЖНО
      setSubCategories([]);
      setSelectedSubCategoryIds([]);
    }
  }, [selectedCategoryIds]);

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function toggleSubCategory(id: number) {
    setSelectedSubCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function applyDates() {
    if (fromDate > toDate) {
      alert("Дата 'от' не может быть позже даты 'до'");
      return;
    }

    setFrom(fromDate.toISOString());
    setTo(toDate.toISOString());
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">

      {/* ✅ MULTI CATEGORY */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[260px] justify-between">
            Категорий: {selectedCategoryIds.length || "все"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          {categories.map((c) => (
            <label key={c.id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(c.id)}
                onChange={() => toggleCategory(c.id)}
              />
              {c.name}
            </label>
          ))}
        </PopoverContent>
      </Popover>

      {/* ✅ MULTI SUB_CATEGORY */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[260px] justify-between">
            Подтипов: {selectedSubCategoryIds.length || "все"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          {subCategories.map((w) => (
            <label key={w.id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selectedSubCategoryIds.includes(w.id)}
                onChange={() => toggleSubCategory(w.id)}
              />
              {w.name}
            </label>
          ))}
        </PopoverContent>
      </Popover>

      {/* MODE */}
      <Button variant="outline" onClick={() => setMode(mode === "time" ? "sequence" : "time")}>
        {mode === "time" ? "По времени" : "По порядку"}
      </Button>

      {/* FROM */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            От: {format(fromDate, "dd.MM.yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} />
        </PopoverContent>
      </Popover>

      {/* TO */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            До: {format(toDate, "dd.MM.yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar mode="single" selected={toDate} onSelect={(d) => d && setToDate(d)} />
        </PopoverContent>
      </Popover>

      <Button onClick={applyDates}>Применить</Button>
    </div>
  );
}
