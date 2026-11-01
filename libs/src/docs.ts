import { loaders, pages, sidebar, site } from 'virtual:site';
import type { DocModule } from '../../ui/src/docs.ts';

export { pages, sidebar, site };
export const npm = `https://www.npmjs.com/package/${site.pkg}`;

/** The content path of a `/v0/...` URL path: `/v0/` is '', `/v0/core/` is `core/index` if any. */
export function contentPath(segments: readonly string[]): string {
  const path = segments.filter(Boolean).join('/');
  return path === '' || findPage(path) ? path : `${path}/index`;
}

export const findPage = (path: string) => pages.find((page) => page.path === path);

/** Loads a page's rendered HTML, or undefined when there is no such page. */
export const loadPage = (path: string): Promise<DocModule> | undefined =>
  loaders[path]?.().then((module) => module.default);

/** Pages whose title, path or description matches every word of the query, best first. */
export function search(query: string, limit = 12) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return pages
    .map((page) => {
      const title = page.title.toLowerCase();
      const haystack = `${title} ${page.path.toLowerCase()} ${(page.description ?? '').toLowerCase()}`;
      const score = words.every((word) => haystack.includes(word))
        ? words.reduce((sum, w) => sum + (title.startsWith(w) ? 3 : title.includes(w) ? 2 : 1), 0)
        : 0;
      return { page, score };
    })
    .filter((hit) => hit.score > 0)
    .toSorted((a, b) => b.score - a.score || a.page.path.localeCompare(b.page.path))
    .slice(0, limit)
    .map((hit) => hit.page);
}
