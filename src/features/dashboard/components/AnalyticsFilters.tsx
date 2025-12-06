import { useEffect, useState } from "react";
import { getWhatHappened, getWhatByParent } from "@/api/dictionaryApi";
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

  selectedWhatIds: number[];
  setSelectedWhatIds: React.Dispatch<React.SetStateAction<number[]>>;

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
  selectedWhatIds,
  setSelectedWhatIds,
  from,
  to,
  setFrom,
  setTo,
  mode,
  setMode,
}: Props) {
  const [categories, setCategories] = useState<DictItem[]>([]);
  const [whats, setWhats] = useState<DictItem[]>([]);

  const [fromDate, setFromDate] = useState(
    from ? new Date(from) : new Date()
  );
  const [toDate, setToDate] = useState(
    to ? new Date(to) : new Date()
  );

  // ✅ загрузка категорий
  useEffect(() => {
    getWhatHappened().then(setCategories);
  }, []);

  // ✅ загрузка WHAT для всех выбранных категорий
  useEffect(() => {
    async function loadWhats() {
      const map = new Map<number, DictItem>();

      for (const id of selectedCategoryIds) {
        const data = await getWhatByParent(id);
        data.forEach((item) => {
          map.set(item.id, item); // ✅ перезапись убирает дубли
        });
      }

      setWhats(Array.from(map.values()));
      setSelectedWhatIds([]);
    }

    if (selectedCategoryIds.length > 0) {
        loadWhats();
    } else {
      // ✅ ВАЖНО
      setWhats([]);
      setSelectedWhatIds([]);
    }
  }, [selectedCategoryIds]);

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function toggleWhat(id: number) {
    setSelectedWhatIds((prev) =>
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

      {/* ✅ MULTI WHAT */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[260px] justify-between">
            Подтипов: {selectedWhatIds.length || "все"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          {whats.map((w) => (
            <label key={w.id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selectedWhatIds.includes(w.id)}
                onChange={() => toggleWhat(w.id)}
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
