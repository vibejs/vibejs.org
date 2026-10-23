import { ref } from '@usevibejs/ui';

export type Theme = 'light' | 'dark';

/** The current theme; index.html applied it to <html> before the app started. */
export const theme = ref<Theme>(
  document.documentElement.classList.contains('dark') ? 'dark' : 'light',
);

/** Switches the theme and remembers it in this browser. */
export function setTheme(next: Theme): void {
  theme.value = next;
  document.documentElement.classList.toggle('dark', next === 'dark');
  document
    .querySelector('meta[name=theme-color]')
    ?.setAttribute('content', next === 'dark' ? '#0a0a0a' : '#ffffff');
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Private windows can refuse storage; the switch still applies to this page.
  }
}
