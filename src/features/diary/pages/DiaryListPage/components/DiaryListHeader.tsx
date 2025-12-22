import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";

type Props = {
  count: number;
  onCreate: () => void;
};

export function DiaryListHeader({ count, onCreate }: Props) {
  return (
    <Card className="max-w-6xl mx-auto mb-8">
      <CardHeader className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-blue-400">Мои записи</CardTitle>
          <CardDescription>Найдено: {count}</CardDescription>
        </div>

        <Button onClick={onCreate}>
          + Создать запись
        </Button>
      </CardHeader>
    </Card>
  );
}
