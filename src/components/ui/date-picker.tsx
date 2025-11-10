import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function DatePicker({ date, setDate }: { date: Date | undefined; setDate: (date: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-[#1C2435] border border-slate-700 hover:border-blue-500 text-gray-200 rounded-xl px-3 py-2",
            !date && "text-gray-500"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
          {date ? format(date, "dd MMM yyyy, HH:mm", { locale: ru }) : "Выбери дату и время"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#1A2235] text-gray-100 border border-slate-700 rounded-xl shadow-lg">
        <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            locale={ru}
            required={false}
            className="bg-[#1A2235] text-gray-100 rounded-xl"
        />
      </PopoverContent>
    </Popover>
  )
}
