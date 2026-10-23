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
// The export script writes content/pages.json; a glob keeps it outside the TypeScript root.
const index = Object.values(
  import.meta.glob<Index>('../../content/pages.json', { eager: true, import: 'default' }),
)[0]!;

/** Every docs page, error pages included, in path order. */
export const pages: readonly DocPage[] = index.pages;

/** The sidebar groups; links are site paths under `/v0`. */
export const sidebar: readonly SidebarGroup[] = index.sidebar.map((group) => ({
  text: group.text,
  items: group.items.map((item) => ({ text: item.text, link: `/v0${item.link}` })),
}));

const modules = import.meta.glob<DocModule>('../../content/**/*.md', { import: 'default' });

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

/** Loads a page's rendered HTML; each page is its own chunk. */
export function loadPage(path: string): Promise<DocModule> | undefined {
  return modules[`../../content/${path}.md`]?.();
}

/** Pages whose title or path matches every word of the query, best matches first. */
export function search(query: string, limit = 12): DocPage[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const score = (page: DocPage): number => {
    const title = page.title.toLowerCase();
    const haystack = `${title} ${page.path.toLowerCase()} ${(page.description ?? '').toLowerCase()}`;
    if (!words.every((word) => haystack.includes(word))) return 0;
    const base = words.reduce(
      (sum, word) => sum + (title.startsWith(word) ? 3 : title.includes(word) ? 2 : 1),
      0,
    );
    // A guide outranks an error page with the same words, unless the query is the code itself.
    return page.path.startsWith('errors/') ? base - 0.5 : base;
  };
  return pages
    .map((page) => ({ page, score: score(page) }))
    .filter((hit) => hit.score > 0)
    .toSorted((a, b) => b.score - a.score || a.page.path.localeCompare(b.page.path))
    .slice(0, limit)
    .map((hit) => hit.page);
}
