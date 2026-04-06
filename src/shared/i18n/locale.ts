import { enUS, ru } from "date-fns/locale";

import i18n from "./config";
import { DEFAULT_LANGUAGE, type AppLanguage } from "./types";

export const dateFnsLocales = {
  ru,
  en: enUS,
} as const;

export const intlLocales: Record<AppLanguage, string> = {
  ru: "ru-RU",
  en: "en-US",
};

export function getCurrentLanguage(): AppLanguage {
  const language = i18n.resolvedLanguage ?? i18n.language;
  return language === "en" ? "en" : DEFAULT_LANGUAGE;
}

export function getDateFnsLocale(language: AppLanguage = getCurrentLanguage()) {
  return dateFnsLocales[language];
}

export function getIntlLocale(language: AppLanguage = getCurrentLanguage()) {
  return intlLocales[language];
}
