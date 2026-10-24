import { defineRoutes } from '@usevibejs/ui/router';
import { contentPath, findPage } from './docs.ts';
import HomePage from './pages/HomePage.vibe';
import NotFoundPage from './pages/NotFoundPage.vibe';

export const routes = defineRoutes([
  { path: '/', name: 'home', component: HomePage },
  { path: '/docs', redirect: '/v0/' },
  {
    path: '/tutorial/:step?',
    name: 'tutorial',
    component: () => import('./pages/TutorialPage.vibe'),
  },
  { path: '/v0/:path*', name: 'docs', component: () => import('./pages/DocsPage.vibe') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]);

const SITE = 'vibe.js';

/** The document title of a URL path: the docs page title, or the site name. */
export function titleOf(fullPath: string): string {
  const path = fullPath.split(/[?#]/)[0]!;
  if (path.startsWith('/tutorial')) return `Tutorial | ${SITE}`;
  if (!path.startsWith('/v0')) return `${SITE}: if it compiles, both sides agree`;
  const page = findPage(contentPath(path.slice(3).split('/')));
  return page ? `${page.title} | ${SITE}` : `Page not found | ${SITE}`;
}
