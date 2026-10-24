import { expect, it } from 'vitest';
import {
  contentPath,
  findPage,
  isTranslated,
  loadPage,
  pages,
  pageTitle,
  search,
  sidebar,
} from './docs.ts';

it('maps URL segments to content paths, index pages included', () => {
  expect(contentPath([])).toBe('index');
  expect(contentPath(['guides', 'tutorial'])).toBe('guides/tutorial');
  expect(contentPath(['errors'])).toBe('errors/index');
  expect(contentPath(['cli', ''])).toBe('cli/index');
});

it('knows every page and links the sidebar under /v0', () => {
  expect(pages.length).toBeGreaterThan(250);
  expect(findPage('errors/VIBE7103')?.title).toBe('Unsupported router option');
  expect(findPage('nope')).toBeUndefined();
  expect(sidebar('en')[0]!.items[0]).toEqual({
    text: 'Getting started',
    link: '/v0/guides/getting-started',
  });
});

it('titles pages in a locale and falls back to English', () => {
  expect(isTranslated('ui/routing', 'tr')).toBe(true);
  expect(isTranslated('errors/VIBE7103', 'tr')).toBe(false);
  expect(pageTitle('errors/VIBE7103', 'ar')).toBe('Unsupported router option');
  expect(pageTitle('ui/routing', 'tr')).not.toBe('Routing');
  expect(pageTitle('nope', 'tr')).toBeUndefined();
});

it('loads a page rendered at build time, with site links turned into paths', async () => {
  const page = await loadPage('ui/routing', 'en')!;
  expect(page.html).toContain('<h1>Routing</h1>');
  expect(page.html).toContain('href="/v0/errors/VIBE7103"');
  expect(page.html).not.toContain('https://vibejs.org/v0/');
  expect(page.headings[0]).toEqual({ depth: 2, id: 'routes', text: 'Routes' });
  expect(loadPage('nope', 'en')).toBeUndefined();
});

it('keeps the English anchors in translated pages', async () => {
  const page = await loadPage('ui/routing', 'tr')!;
  expect(page.headings[0]!.id).toBe('routes');
  expect(page.html).not.toContain('{#');
  const fallback = await loadPage('errors/VIBE7103', 'tr')!;
  expect(fallback.html).toContain('VIBE7103');
});

it('ranks guides above error pages and finds codes', () => {
  expect(search('', 'en')).toEqual([]);
  expect(search('contracts', 'en')[0]!.path).toBe('server/contracts');
  expect(search('VIBE7103', 'tr')[0]!.path).toBe('errors/VIBE7103');
  expect(search('zzzz', 'en')).toEqual([]);
});
