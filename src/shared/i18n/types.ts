export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "ru";
export const LANGUAGE_STORAGE_KEY = "app-language";
