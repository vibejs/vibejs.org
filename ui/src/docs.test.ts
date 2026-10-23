import { expect, it } from 'vitest';
import { contentPath, findPage, loadPage, pages, search, sidebar } from './docs.ts';

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
  expect(sidebar[0]!.items[0]!.link).toBe('/v0/guides/getting-started');
});

it('loads a page rendered at build time, with site links turned into paths', async () => {
  const page = await loadPage('ui/routing')!;
  expect(page.html).toContain('<h1>Routing</h1>');
  expect(page.html).toContain('href="/v0/errors/VIBE7103"');
  expect(page.html).not.toContain('https://vibejs.org/v0/');
  expect(page.headings[0]).toEqual({ depth: 2, id: 'routes', text: 'Routes' });
  expect(loadPage('nope')).toBeUndefined();
});

it('ranks guides above error pages and finds codes', () => {
  expect(search('')).toEqual([]);
  expect(search('contracts')[0]!.path).toBe('server/contracts');
  expect(search('VIBE7103')[0]!.path).toBe('errors/VIBE7103');
  expect(search('zzzz')).toEqual([]);
});
