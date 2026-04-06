import { en } from "./en";
import { ru } from "./ru";

export const defaultNS = "translation";

export const resources = {
  ru: {
    translation: ru,
  },
  en: {
    translation: en,
  },
} as const;
