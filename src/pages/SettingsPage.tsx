
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("settings.title")}</h1>
      <div className="bg-gray-800 p-4 rounded">
        <p>{t("settings.placeholder")}</p>
      </div>
    </div>
  );
}
