import { createApp, isVibeError } from '@usevibejs/ui';
import { createRouter, createWebHistory, type RouterScrollBehavior } from '@usevibejs/ui/router';
import App from './App.vibe';
import { applyLocale, localePath, preferredLocale, splitLocale, t } from './i18n.ts';
import { applyRouteMeta } from './meta.ts';
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

const routeStatus = document.createElement('p');
routeStatus.setAttribute('aria-live', 'polite');
routeStatus.className = 'sr-only';
document.body.append(routeStatus);
let announceRoute = false;

// The URL prefix decides the language of every page.
router.beforeEach((to) => {
  applyLocale(splitLocale(to.path).locale);
});
router.afterEach((to, _from, failure) => {
  const title = titleOf(to.fullPath);
  applyRouteMeta(to.fullPath, title);
  // Move focus to main content so screen readers land after a client-side navigation.
  if (announceRoute) document.getElementById('main')?.focus({ preventScroll: true });
  // Skip the first load: the browser already announces the document title.
  if (failure || !announceRoute) {
    announceRoute = true;
    return;
  }
  routeStatus.textContent = t('a11y.pageLoaded', { title });
});
// After a deploy, an open tab can ask for a page chunk that is gone: load the page again.
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});

createApp(App).use(router).mount('#app');
