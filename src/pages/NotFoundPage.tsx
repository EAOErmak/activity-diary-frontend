// src/pages/Settings/NotFoundPage.tsx
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg text-gray-400">{t("notFound.title")}</p>
    </div>
  );
}
