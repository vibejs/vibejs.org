import { contentPath, findPage, pageTitle } from './docs.ts';
import { localePath, splitLocale, t, type Locale } from './i18n.ts';

const ORIGIN = 'https://vibejs.org';
const OG_IMAGE = `${ORIGIN}/og.png`;

function ensureMeta(attr: 'name' | 'property', key: string): HTMLMetaElement {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  return el;
}

function ensureLink(rel: string): HTMLLinkElement {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.append(el);
  }
  return el;
}

function descriptionFor(fullPath: string): string {
  const { locale, path } = splitLocale(fullPath.split(/[?#]/)[0]!);
  if (path.startsWith('/tutorial')) return t('meta.tutorial');
  if (!path.startsWith('/v0')) return t('meta.home');
  const page = findPage(contentPath(path.slice(3).split('/')));
  if (!page) return t('meta.docs');
  return page.description || pageTitle(page.path, locale as Locale) || t('meta.docs');
}

/** Updates title, description, canonical and Open Graph tags for the current route. */
export function applyRouteMeta(fullPath: string, title: string): void {
  const pathOnly = fullPath.split(/[?#]/)[0]!;
  const { locale, path } = splitLocale(pathOnly);
  const description = descriptionFor(pathOnly);
  const canonical = `${ORIGIN}${localePath(path, locale)}`;

  document.title = title;
  ensureMeta('name', 'description').content = description;
  ensureMeta('property', 'og:title').content = title;
  ensureMeta('property', 'og:description').content = description;
  ensureMeta('property', 'og:url').content = canonical;
  ensureMeta('property', 'og:type').content = 'website';
  ensureMeta('property', 'og:site_name').content = 'vibe.js';
  ensureMeta('property', 'og:image').content = OG_IMAGE;
  ensureMeta('property', 'og:locale').content =
    locale === 'tr' ? 'tr_TR' : locale === 'ar' ? 'ar_AR' : 'en_US';
  ensureMeta('name', 'twitter:card').content = 'summary_large_image';
  ensureMeta('name', 'twitter:title').content = title;
  ensureMeta('name', 'twitter:description').content = description;
  ensureMeta('name', 'twitter:image').content = OG_IMAGE;
  ensureLink('canonical').href = canonical;

  for (const link of document.head.querySelectorAll('link[rel="alternate"][hreflang]')) {
    link.remove();
  }
  for (const code of ['en', 'tr', 'ar'] as const) {
    const alt = document.createElement('link');
    alt.rel = 'alternate';
    alt.hreflang = code;
    alt.href = `${ORIGIN}${localePath(path, code)}`;
    document.head.append(alt);
  }
  const xDefault = document.createElement('link');
  xDefault.rel = 'alternate';
  xDefault.hreflang = 'x-default';
  xDefault.href = `${ORIGIN}${localePath(path, 'en')}`;
  document.head.append(xDefault);
}
