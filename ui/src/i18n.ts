import { ref } from '@usevibejs/ui';
import { format, MESSAGES, type MessageKey } from './messages.ts';

export type Locale = 'en' | 'tr' | 'ar';

export const LOCALES: { code: Locale; name: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

const STORAGE_KEY = 'locale';

/** The locale of the current page; the router sets it from the URL prefix. */
export const locale = ref<Locale>('en');

const isLocale = (value: unknown): value is Locale => LOCALES.some((l) => l.code === value);

/** The URL prefix of a locale: none for English, `/tr` and `/ar` for the others. */
export const prefixOf = (code: Locale): string => (code === 'en' ? '' : `/${code}`);

/** Splits `/tr/v0/ui` into the locale and the path without its prefix. */
export function splitLocale(path: string): { locale: Locale; path: string } {
  const match = /^\/(tr|ar)(?=\/|$)/.exec(path);
  if (!match) return { locale: 'en', path };
  return { locale: match[1] as Locale, path: path.slice(match[0].length) || '/' };
}

/** A site path in a locale: `/v0/ui` becomes `/tr/v0/ui` in Turkish. */
export function localePath(path: string, code: Locale = locale.value): string {
  const bare = splitLocale(path).path;
  const prefix = prefixOf(code);
  return prefix && bare === '/' ? prefix : `${prefix}${bare}`;
}

/** Applies a locale to the document: `lang`, `dir` and the stored choice. */
export function applyLocale(code: Locale, remember = false): void {
  locale.value = code;
  const root = document.documentElement;
  root.lang = code;
  root.dir = LOCALES.find((l) => l.code === code)!.dir;
  if (!remember) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private windows can refuse storage; the choice still applies to this page.
  }
}

/**
 * The locale a first visit to an English URL should see: the stored choice, or else the first
 * browser language we have; English otherwise.
 */
export function preferredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // No storage: fall through to the browser languages.
  }
  for (const language of navigator.languages ?? [navigator.language]) {
    const code = language.toLowerCase().split('-')[0];
    if (isLocale(code)) return code;
  }
  return 'en';
}

/** The text of a message in the current locale, falling back to English. */
export function t(key: MessageKey, values?: Record<string, string | number>): string {
  const text = (MESSAGES[locale.value][key] ?? MESSAGES.en[key])!;
  return values ? format(text, values) : text;
}

const escapeHtml = (value: string | number): string =>
  String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** `t()` for messages rendered with v-html: the values are escaped, the message markup is kept. */
export function th(key: MessageKey, values: Record<string, string | number>): string {
  return t(
    key,
    Object.fromEntries(Object.entries(values).map(([name, value]) => [name, escapeHtml(value)])),
  );
}
