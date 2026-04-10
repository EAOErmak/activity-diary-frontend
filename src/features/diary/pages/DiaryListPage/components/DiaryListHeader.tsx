import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";

type Props = {
  count: number;
  onCreate: () => void;
};

export function DiaryListHeader({ count, onCreate }: Props) {
  const { t } = useTranslation();
  return (
    <Card className="mb-8 w-full">
      <CardHeader className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-blue-400">{t("diary.myEntries")}</CardTitle>
          <CardDescription>{t("diary.foundCount", { count })}</CardDescription>
        </div>

        <Button onClick={onCreate}>
          {t("diary.createEntry")}
        </Button>
      </CardHeader>
    </Card>
  );
}
