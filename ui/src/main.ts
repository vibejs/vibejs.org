import { createApp, isVibeError } from '@usevibejs/ui';
import { createRouter, createWebHistory, type RouterScrollBehavior } from '@usevibejs/ui/router';
import App from './App.vibe';
import { applyLocale, localePath, preferredLocale, splitLocale } from './i18n.ts';
import { routes, titleOf } from './routes.ts';
import './styles.css';

// Honor an explicit language-picker choice on English URLs. Do not sniff the browser language:
// shared English links and crawlers must keep the path they were given.
if (splitLocale(location.pathname).locale === 'en') {
  const preferred = preferredLocale();
  if (preferred !== 'en') {
    history.replaceState(
      null,
      '',
      localePath(location.pathname, preferred) + location.search + location.hash,
    );
  }
}

// Typed on its own: inline, its parameters would depend on the router type being declared.
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

// The URL prefix decides the language of every page.
router.beforeEach((to) => {
  applyLocale(splitLocale(to.path).locale);
});
router.afterEach((to) => {
  document.title = titleOf(to.fullPath);
});
// After a deploy, an open tab can ask for a page chunk that is gone: load the page again.
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});

createApp(App).use(router).mount('#app');
