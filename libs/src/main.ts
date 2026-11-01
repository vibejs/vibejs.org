import { createApp, isVibeError } from '@usevibejs/ui';
import {
  createRouter,
  createWebHistory,
  defineRoutes,
  type RouterScrollBehavior,
} from '@usevibejs/ui/router';
import App from './App.vibe';
import { contentPath, findPage, site } from './docs.ts';
import HomePage from './pages/HomePage.vibe';
import NotFoundPage from './pages/NotFoundPage.vibe';
import './styles.css';

const routes = defineRoutes([
  { path: '/', name: 'home', component: HomePage },
  { path: '/docs', redirect: '/v0/' },
  { path: '/v0/:path*', name: 'docs', component: () => import('./pages/DocsPage.vibe') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]);

const scrollBehavior: RouterScrollBehavior = (to, _from, saved) => {
  if (saved) return saved;
  if (to.hash) return { el: to.hash };
  return { top: 0 };
};

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior });

declare module '@usevibejs/ui/router' {
  interface Register {
    router: typeof router;
  }
}

router.afterEach((to) => {
  if (!to.path.startsWith('/v0')) return void (document.title = `${site.name}: ${site.tagline}`);
  const page = findPage(contentPath(to.path.slice(3).split('/')));
  document.title = `${page?.title ?? 'Page not found'} | ${site.name}`;
});
// After a deploy, an open tab can ask for a page chunk that is gone: load the page again.
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});

createApp(App).use(router).mount('#app');
