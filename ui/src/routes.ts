import { defineRoutes } from '@usevibejs/ui/router';
import { contentPath, pageTitle } from './docs.ts';
import { splitLocale, prefixOf, type Locale } from './i18n.ts';
import { MESSAGES } from './messages.ts';
import HomePage from './pages/HomePage.vibe';
import NotFoundPage from './pages/NotFoundPage.vibe';

const DocsPage = () => import('./pages/DocsPage.vibe');
const TutorialPage = () => import('./pages/TutorialPage.vibe');

/** The same pages under each locale prefix: none for English, `/tr` and `/ar` for the others. */
const localized = (code: Locale) => {
  const prefix = prefixOf(code);
  const name = (base: string) => (code === 'en' ? base : `${base}-${code}`);
  return [
    { path: prefix || '/', name: name('home'), component: HomePage },
    { path: `${prefix}/docs`, redirect: `${prefix}/v0/` },
    { path: `${prefix}/tutorial/:step?`, name: name('tutorial'), component: TutorialPage },
    { path: `${prefix}/v0/:path*`, name: name('docs'), component: DocsPage },
  ];
};

export const routes = defineRoutes([
  ...localized('en'),
  ...localized('tr'),
  ...localized('ar'),
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]);

/** The document title of a URL path, in the locale of its prefix. */
export function titleOf(fullPath: string): string {
  const { locale, path } = splitLocale(fullPath.split(/[?#]/)[0]!);
  const messages = { ...MESSAGES.en, ...MESSAGES[locale] } as Record<
    keyof typeof MESSAGES.en,
    string
  >;
  const SITE = 'vibe.js';
  if (path.startsWith('/tutorial')) return `${messages['title.tutorial']} | ${SITE}`;
  if (!path.startsWith('/v0')) return messages['title.home'];
  const title = pageTitle(contentPath(path.slice(3).split('/')), locale);
  return title ? `${title} | ${SITE}` : `${messages['title.notFound']} | ${SITE}`;
}
