import type { Locale } from './i18n.ts';

/** A heading of a docs page, for the "On this page" list. */
export interface Heading {
  depth: number;
  id: string;
  text: string;
}

/** What a `.md` import exports: the page rendered at build time and its h2/h3 headings. */
export interface DocModule {
  html: string;
  headings: Heading[];
}

export interface DocPage {
  path: string;
  title: string;
  description?: string;
}

export interface SidebarGroup {
  text: string;
  items: { text: string; link: string }[];
}

interface Index {
  pages: DocPage[];
  sidebar: SidebarGroup[];
}
// The sync script writes content/pages.json; a glob keeps it outside the TypeScript root.
const index = Object.values(
  import.meta.glob<Index>('../../content/pages.json', { eager: true, import: 'default' }),
)[0]!;

/** Every docs page, error pages included, in path order, with its English title. */
export const pages: readonly DocPage[] = index.pages;

const modules = import.meta.glob<DocModule>('../../content/**/*.md', { import: 'default' });
// The titles of translated pages, without loading the pages themselves.
const titles = import.meta.glob<string>(['../../content/tr/**/*.md', '../../content/ar/**/*.md'], {
  query: '?title',
  import: 'default',
  eager: true,
});
// Raw Markdown for search: titles alone miss contract prose and CLI wording.
const rawMarkdown = import.meta.glob<string>('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const file = (path: string, locale: Locale) =>
  locale === 'en' ? `../../content/${path}.md` : `../../content/${locale}/${path}.md`;

/** Strips Markdown noise so search matches the words a reader would see. */
function searchable(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\(([^)]*)\)/g, ' $1 ')
    .replace(/\{#[\w-]+\}/g, ' ')
    .replace(/[#>*_-]+/g, ' ')
    .toLowerCase();
}

const bodies = new Map<string, string>();
for (const [key, text] of Object.entries(rawMarkdown)) {
  bodies.set(key, searchable(text));
}

/** The content path of a `/v0/...` URL path: `/v0/` is `index`, `/v0/cli/` is `cli/index`. */
export function contentPath(segments: readonly string[]): string {
  const parts = segments.filter(Boolean);
  if (parts.length === 0) return 'index';
  const path = parts.join('/');
  return pages.some((page) => page.path === path) ? path : `${path}/index`;
}

/** The page at a content path, or undefined when there is none. */
export const findPage = (path: string): DocPage | undefined =>
  pages.find((page) => page.path === path);

/** Whether a page has a translation in a locale (English always does). */
export const isTranslated = (path: string, locale: Locale): boolean =>
  locale === 'en' || file(path, locale) in modules;

/** A page's title in a locale, or in English when it has no translation; undefined if no page. */
export function pageTitle(path: string, locale: Locale): string | undefined {
  const page = findPage(path);
  if (!page) return undefined;
  return (locale !== 'en' && titles[file(path, locale)]) || page.title;
}

/** Loads a page's rendered HTML in a locale, or the English page when it has no translation. */
export function loadPage(path: string, locale: Locale): Promise<DocModule> | undefined {
  return (modules[file(path, locale)] ?? modules[file(path, 'en')])?.();
}

/** The sidebar groups in a locale; links are site paths under `/v0`, without a locale prefix. */
export function sidebar(locale: Locale): SidebarGroup[] {
  return index.sidebar.map((group) => {
    const items = group.items.map((item) => ({
      text: pageTitle(contentPath(item.link.split('/')), locale) ?? item.text,
      link: `/v0${item.link}`,
    }));
    // Beginners hit UI essentials first; the synced order puts Components ahead of it.
    if (group.text === 'UI') {
      const essentials = items.findIndex((item) => item.link === '/v0/ui/');
      if (essentials > 0) {
        const [page] = items.splice(essentials, 1);
        items.unshift(page!);
      }
    }
    return { text: group.text, items };
  });
}

/** Pages whose title, path, description or body matches every word of the query. */
export function search(query: string, locale: Locale, limit = 12): DocPage[] {
  // Plain lowercasing: Turkish rules would turn the I of VIBE into a dotless ı.
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const score = (page: DocPage): number => {
    const title = (pageTitle(page.path, locale) ?? page.title).toLowerCase();
    const body = bodies.get(file(page.path, locale)) ?? bodies.get(file(page.path, 'en')) ?? '';
    const haystack = `${title} ${page.title.toLowerCase()} ${page.path.toLowerCase()} ${(page.description ?? '').toLowerCase()} ${body}`;
    if (!words.every((word) => haystack.includes(word))) return 0;
    const base = words.reduce((sum, word) => {
      if (title.startsWith(word)) return sum + 3;
      if (title.includes(word)) return sum + 2;
      if (
        page.path.toLowerCase().includes(word) ||
        (page.description ?? '').toLowerCase().includes(word)
      )
        return sum + 1.5;
      return sum + 1;
    }, 0);
    // A guide outranks an error page with the same words, unless the query is the code itself.
    return page.path.startsWith('errors/') ? base - 0.5 : base;
  };
  return pages
    .map((page) => ({
      page: { ...page, title: pageTitle(page.path, locale) ?? page.title },
      score: score(page),
    }))
    .filter((hit) => hit.score > 0)
    .toSorted((a, b) => b.score - a.score || a.page.path.localeCompare(b.page.path))
    .slice(0, limit)
    .map((hit) => hit.page);
}
