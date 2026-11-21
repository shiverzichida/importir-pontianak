export type Locale = 'id' | 'en' | 'zh';

export const SUPPORTED_LOCALES: Locale[] = ['id', 'en', 'zh'];

export const LOCALE_COOKIE_NAME = 'imp_lang';

export function normalizeLocale(val: string | undefined | null): Locale {
  if (val === 'en' || val === 'zh' || val === 'id') {
    return val;
  }
  return 'id';
}
