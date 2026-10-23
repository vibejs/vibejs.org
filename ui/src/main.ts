import { createApp, isVibeError } from '@usevibejs/ui';
import { createRouter, createWebHistory, type RouterScrollBehavior } from '@usevibejs/ui/router';
import App from './App.vibe';
import { routes, titleOf } from './routes.ts';
import './styles.css';

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

router.afterEach((to) => {
  document.title = titleOf(to.fullPath);
});
// After a deploy, an open tab can ask for a page chunk that is gone: load the page again.
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});

createApp(App).use(router).mount('#app');
