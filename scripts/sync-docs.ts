// Usage: node scripts/sync-docs.ts <path to a vibejs/vibejs checkout, built>
// Regenerates content/ and ui/public/v0/llms*.txt from that checkout: the error pages from the
// packages' messages, the CLI reference from the built CLI, and every docs page as site-linked
// Markdown, using the checkout's own docs tooling.
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

interface Page {
  path: string;
  title: string;
  description?: string;
  markdown: string;
}
interface DocsTools {
  loadSource(dir: string, o: { errors?: boolean }): Page[];
  expandIncludes(md: string, dir: string, page: string): string;
  toAgentMarkdown(page: Page, links: 'site'): string;
  sidebar(pages: readonly Page[]): unknown;
  llms(pages: readonly Page[]): Record<string, string>;
}

interface SidebarGroup {
  text: string;
  items: { text: string; link: string }[];
}

/** English pages this site owns. `sync-docs` regenerates the vibejs docs and must keep these. */
const SITE_PAGES: readonly {
  path: string;
  title: string;
  description: string;
  group: string;
}[] = [
  {
    path: 'ecosystem',
    title: 'Ecosystem',
    description:
      'Every vibe.js package in one sentence, the install command its README shows, and the saas preset that is still coming.',
    group: 'Ecosystem',
  },
];

const vibejs = process.argv[2];
if (!vibejs) {
  console.error('Usage: node scripts/sync-docs.ts <path to a vibejs/vibejs checkout>');
  process.exit(2);
}
const root = resolve(vibejs);
const docs = join(root, 'docs');
const site = fileURLToPath(new URL('..', import.meta.url));
const tools = (await import(pathToFileURL(join(docs, 'scripts/docs.ts')).href)) as DocsTools;

// Generate into a copy, so the checkout stays untouched.
const work = mkdtempSync(join(tmpdir(), 'vibejs-docs-'));
cpSync(docs, work, { recursive: true, filter: (src) => !src.includes('node_modules') });
execFileSync('node', [join(root, 'scripts/errors.ts'), '--docs', join(work, 'errors')], {
  stdio: 'inherit',
});
execFileSync('node', [join(docs, 'scripts/docs.ts'), 'cli', join(work, 'cli')], {
  stdio: 'inherit',
});

const pages = tools.loadSource(work, { errors: true }).map((page) => ({
  ...page,
  // Includes point at files next to docs/ in the checkout, such as examples/.
  markdown: tools.expandIncludes(page.markdown, docs, page.path),
}));
const write = (file: string, text: string) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
};
const content = join(site, 'content');
const siteBodies = new Map(
  SITE_PAGES.flatMap((page) => {
    const file = join(content, `${page.path}.md`);
    return existsSync(file) ? [[page.path, readFileSync(file, 'utf8')] as const] : [];
  }),
);
// English pages are regenerated; keep locale trees (tr/, ar/) across syncs.
const localeBackup = mkdtempSync(join(tmpdir(), 'vibejs-locales-'));
for (const code of ['tr', 'ar'] as const) {
  const dir = join(content, code);
  if (existsSync(dir)) cpSync(dir, join(localeBackup, code), { recursive: true });
}
rmSync(content, { recursive: true, force: true });
for (const page of pages) {
  write(join(content, `${page.path}.md`), `${tools.toAgentMarkdown(page, 'site')}\n`);
}
for (const code of ['tr', 'ar'] as const) {
  const dir = join(localeBackup, code);
  if (existsSync(dir)) cpSync(dir, join(content, code), { recursive: true });
}
rmSync(localeBackup, { recursive: true, force: true });
for (const [path, text] of siteBodies) {
  write(join(content, `${path}.md`), text.endsWith('\n') ? text : `${text}\n`);
}
const sidebar = structuredClone(
  tools.sidebar(pages.filter((page) => !page.path.startsWith('errors/'))) as SidebarGroup[],
);
for (const sitePage of SITE_PAGES) {
  const link = `/${sitePage.path}`;
  let group = sidebar.find((item) => item.text === sitePage.group);
  if (!group) {
    group = { text: sitePage.group, items: [] };
    const after = sidebar.findIndex((item) => item.text === 'Getting started');
    sidebar.splice(after + 1, 0, group);
  }
  if (!group.items.some((item) => item.link === link)) {
    group.items.push({ text: sitePage.title, link });
  }
}
const index = {
  pages: [
    ...pages.map(({ path, title, description }) => ({ path, title, description })),
    ...SITE_PAGES.filter((sitePage) => !pages.some((page) => page.path === sitePage.path)).map(
      ({ path, title, description }) => ({ path, title, description }),
    ),
  ].toSorted((a, b) => a.path.localeCompare(b.path)),
  sidebar,
};
write(join(content, 'pages.json'), `${JSON.stringify(index, null, 2)}\n`);
const llmFiles = tools.llms(pages);
const llmLinks = SITE_PAGES.map(
  (page) => `- [${page.title}](https://vibejs.org/v0/${page.path}): ${page.description}`,
).join('\n');
if (llmFiles['llms.txt']) {
  llmFiles['llms.txt'] =
    `${llmFiles['llms.txt'].replace(/\n*$/, '\n')}\n## Ecosystem\n\n${llmLinks}\n`;
}
const llmFull = [...siteBodies.values()].map((text) => text.trimEnd()).join('\n\n---\n\n');
if (llmFull && llmFiles['llms-full.txt']) {
  llmFiles['llms-full.txt'] =
    `${llmFiles['llms-full.txt'].replace(/\n*$/, '\n')}\n---\n\n${llmFull}\n`;
}
for (const [name, text] of Object.entries(llmFiles)) {
  write(join(site, 'ui', 'public', 'v0', name), text);
}
rmSync(work, { recursive: true, force: true });
console.log(
  `synced ${pages.length} English pages from ${root} (${siteBodies.size} site pages kept)`,
);
