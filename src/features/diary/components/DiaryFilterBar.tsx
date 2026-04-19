import React from "react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { DatePicker } from "@/shared/components/ui/date-picker";

export function DiaryFilterBar({
  status,
  setStatus,
  search,
  setSearch,
  date,
  setDate,
}: any) {
  return (
    <div className="flex flex-wrap gap-4 justify-center sm:justify-start bg-[#151C2C]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800/50 shadow-lg">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="bg-[#1C2435] text-gray-100 border-none rounded-xl w-44">
          <SelectValue placeholder="РЎС‚Р°С‚СѓСЃ" />
        </SelectTrigger>
        <SelectContent className="bg-[#1C2435] text-gray-200 border border-slate-700/60">
          <SelectItem value="">Р’СЃРµ</SelectItem>
          <SelectItem value="ACTIVE">РђРєС‚РёРІРЅС‹Рµ</SelectItem>
          <SelectItem value="PLANNED">Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅРЅС‹Рµ</SelectItem>
          <SelectItem value="OVERDUE">РџСЂРѕСЃСЂРѕС‡РµРЅРЅС‹Рµ</SelectItem>
          <SelectItem value="FINISHED">Р—Р°РІРµСЂС€С‘РЅРЅС‹Рµ</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-56 bg-[#1C2435] border-none rounded-xl text-gray-100"
      />

      <div className="rounded-xl overflow-hidden">
        <DatePicker date={date} setDate={setDate} />
      </div>
    </div>
  );
}
