// One library's docs site: `LIB=vibequery vite build libs`. libs/deploy.ts builds and ships all.
import { globSync, readFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { vibe } from '@usevibejs/compiler/vite';
import { defineConfig, type Plugin } from 'vite';
import { markdown } from '../build/markdown.ts';
import { checkout, SITES, type Site } from './sites.ts';

const id = process.env.LIB ?? 'vibeuse';
const site = SITES.find((s) => s.id === id);
if (!site) throw new Error(`LIB=${id}: not one of ${SITES.map((s) => s.id).join(', ')}`);
const root = checkout(site);
const url = `https://${site.domain}/`;

/** The content path of a checkout file: README.md and docs/README.md are '', docs/a/b.md is a/b. */
function contentPath(file: string): string | undefined {
  if (file === 'README.md' || file === 'docs/README.md') return '';
  if (file.startsWith('docs/') && file.endsWith('.md')) return file.slice(5, -3);
  return undefined;
}

/** Points a page's relative links at site paths, and at GitHub for files outside the docs. */
function rewriteLinks(markdown: string, file: string): string {
  // Fenced code stays as written: odd segments are the code blocks.
  return markdown
    .split(/^(```[\s\S]*?^```)/m)
    .map((part, index) =>
      index % 2
        ? part
        : part.replace(/(!?)\]\(([^)\s]+)\)/g, (match, image: string, href: string) => {
            if (/^([a-z]+:|#|\/)/i.test(href)) return match;
            const [target = '', hash] = href.split('#');
            const path = posix.normalize(posix.join(posix.dirname(file), target));
            const page = contentPath(path);
            if (page !== undefined) return `](/v0/${page}${hash ? `#${hash}` : ''})`;
            const base = image ? `${site.github}/raw/main` : `${site.github}/blob/main`;
            return `${image}](${base}/${path}${hash ? `#${hash}` : ''})`;
          }),
    )
    .join('');
}

/** `virtual:site`: the site, its pages with titles, the sidebar and a loader per page. */
function docs(site: Site): Plugin {
  const files = ['README.md', ...globSync('docs/**/*.md', { cwd: root })].filter(
    (file) => file !== 'docs/README.md',
  );
  const pages = files.map((file) => {
    const text = readFileSync(join(root, file), 'utf8');
    const path = contentPath(file)!;
    const title = path ? (/^# (.+)$/m.exec(text)?.[1]?.trim() ?? path) : 'Introduction';
    // The first prose line after the title, for search.
    const description = text
      .split('\n')
      .find((line) => /^[A-Za-z`*]/.test(line) && !line.startsWith('```'))
      ?.replace(/[*`[\]]|\(http[^)]*\)/g, '')
      .slice(0, 200);
    return { path, title, description, file: join(root, file) };
  });
  const byPath = new Map(pages.map((page) => [page.path, page]));
  const sidebar = site.sidebar.map((group) => ({
    text: group.text,
    items: group.items
      .flatMap((item) =>
        item.endsWith('/*')
          ? pages
              .filter((p) => p.path.startsWith(item.slice(0, -1)))
              .map((p) => p.path)
              .toSorted()
          : [item],
      )
      .map((path) => {
        const page = byPath.get(path);
        if (!page) throw new Error(`${site.id} sidebar: no page ${path}`);
        return { text: page.title, link: `/v0/${path}` };
      }),
  }));
  const loaders = pages
    .map((p) => `${JSON.stringify(p.path)}: () => import(${JSON.stringify(p.file)})`)
    .join(',\n');
  const { sidebar: _, ...meta } = site;
  return {
    name: 'vibejs-lib-docs',
    enforce: 'pre',
    resolveId: (source) => (source === 'virtual:site' ? '\0virtual:site' : undefined),
    load(source) {
      if (source !== '\0virtual:site') return;
      return [
        `export const site = ${JSON.stringify(meta)};`,
        `export const pages = ${JSON.stringify(pages.map(({ path, title, description }) => ({ path, title, description })))};`,
        `export const sidebar = ${JSON.stringify(sidebar)};`,
        `export const loaders = {\n${loaders}\n};`,
      ].join('\n');
    },
    transform(code, file) {
      if (!file.endsWith('.md') || !file.startsWith(root)) return;
      return { code: rewriteLinks(code, relative(root, file)), map: null };
    },
    transformIndexHtml: (html) =>
      html
        .replaceAll('%NAME%', site.name)
        .replaceAll('%TAGLINE%', site.tagline)
        .replaceAll('%URL%', url),
  };
}

export default defineConfig({
  plugins: [docs(site), vibe(), markdown(url), tailwindcss()],
  build: { target: 'es2022', outDir: `dist/${site.id}`, emptyOutDir: true },
  cacheDir: process.env.VITE_CACHE_DIR,
  // The pages live in the library's checkout, next to this repository.
  server: { fs: { allow: [dirname(root)] } },
});
