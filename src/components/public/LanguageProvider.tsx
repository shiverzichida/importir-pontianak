'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import {
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type Locale,
} from '@/lib/i18n/types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  initialLocale: Locale;
  children: ReactNode;
}

export function LanguageProvider({
  initialLocale,
  children,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    normalizeLocale(initialLocale)
  );

  const setLocale = useCallback((nextRaw: Locale) => {
    const next = normalizeLocale(nextRaw);
    setLocaleState(next);

    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : next;
      document.title = getDictionary(next).meta.title;
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_COOKIE_NAME, next);
      } catch {
        // Ignore storage errors in restricted environments
      }
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      dict: getDictionary(locale),
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
