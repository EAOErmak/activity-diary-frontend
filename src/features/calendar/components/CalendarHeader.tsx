import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import WeekNav from "@/features/calendar/components/WeekNav";
import { Card } from "@/shared/components/ui/card";

type Props = {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onCreate: () => void;
};

export function CalendarHeader({
  weekLabel,
  onPrev,
  onNext,
  onCreate,
}: Props) {
  const { t } = useTranslation();
  return (
    <Card className="
      flex items-center justify-between
      px-6 py-4
    ">
      <WeekNav label={weekLabel} onPrev={onPrev} onNext={onNext} />

      <Button variant="primary" onClick={onCreate}>
        {t("calendar.createEntry")}
      </Button>
    </Card>
  );
}
