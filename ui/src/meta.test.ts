import { afterEach, expect, it } from 'vitest';
import { applyLocale } from './i18n.ts';
import { applyRouteMeta } from './meta.ts';

afterEach(() => {
  applyLocale('en');
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
});

it('writes description, canonical and Open Graph tags for the home page', () => {
  applyRouteMeta('/', 'vibe.js: if it compiles, both sides agree');
  expect(document.title).toBe('vibe.js: if it compiles, both sides agree');
  expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
    '@usevibejs',
  );
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
    'https://vibejs.org/',
  );
  expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
    'https://vibejs.org/og.png',
  );
  expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
    'summary_large_image',
  );
  expect(
    [...document.head.querySelectorAll('link[rel="alternate"][hreflang]')].map((el) =>
      el.getAttribute('hreflang'),
    ),
  ).toEqual(['en', 'tr', 'ar', 'x-default']);
});

it('localizes tutorial meta and the canonical URL', () => {
  applyLocale('tr');
  applyRouteMeta('/tr/tutorial/forms', 'Tarayıcıda öğren | vibe.js');
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
    'https://vibejs.org/tr/tutorial/forms',
  );
  expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
    'Tarayıcıda',
  );
  expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
    'tr_TR',
  );
});

it('uses a docs page description when the route is under /v0', () => {
  applyRouteMeta('/v0/ui/routing', 'Routing | vibe.js');
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  expect(description).toBeTruthy();
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
    'https://vibejs.org/v0/ui/routing',
  );
});

it('falls back for unknown docs paths', () => {
  applyRouteMeta('/v0/nope', 'Page not found | vibe.js');
  expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
    'documentation',
  );
});
