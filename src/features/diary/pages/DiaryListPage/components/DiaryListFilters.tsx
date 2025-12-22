import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";

export function DiaryListFilters({...props}) {
  return (
    <Card className="max-w-6xl mx-auto mb-10">
      <CardContent className="flex flex-col sm:flex-row gap-6 pt-2 pb-6">
        
        {/* STATUS */}
        <div className="flex-1">
          <Label>Статус</Label>
          <Select
            value={props.status || "ALL"}
            onValueChange={(v) =>
              props.onStatusChange(v === "ALL" ? "" : v as any)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все</SelectItem>
              <SelectItem value="ACTIVE">В процессе</SelectItem>
              <SelectItem value="PLANNED">Запланировано</SelectItem>
              <SelectItem value="WIN">Успех</SelectItem>
              <SelectItem value="LOSE">Провал</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SEARCH */}
        <div className="flex-1">
          <Label>Поиск</Label>
          <Input
            placeholder="Поиск по названию"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
          />
        </div>

        {/* DATE */}
        <div className="flex-1">
          <Label>Дата</Label>
          <DatePicker date={props.date} setDate={props.onDateChange} />
        </div>

        {/* RESET */}
        <div className="flex items-end">
          <Button variant="primary" onClick={props.onReset}>
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
