import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/shared/i18n/config";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type AppLanguage,
} from "@/shared/i18n/types";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function resolveLanguage(value?: string): AppLanguage {
  return value === "en" ? "en" : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(
    resolveLanguage(i18n.resolvedLanguage ?? i18n.language)
  );

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    const handleLanguageChange = (nextLanguage: string) => {
      setLanguageState(resolveLanguage(nextLanguage));
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: async (nextLanguage) => {
        await i18n.changeLanguage(nextLanguage);
      },
      toggleLanguage: async () => {
        await i18n.changeLanguage(language === "ru" ? "en" : "ru");
      },
    }),
    [language]
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguageContext must be used inside LanguageProvider");
  }

  return context;
}
