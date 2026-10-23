// Usage: node scripts/sync-docs.ts <path to a vibejs/vibejs checkout, built>
// Regenerates content/ and ui/public/v0/llms*.txt from that checkout: the error pages from the
// packages' messages, the CLI reference from the built CLI, and every docs page as site-linked
// Markdown, using the checkout's own docs tooling.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
rmSync(join(site, 'content'), { recursive: true, force: true });
for (const page of pages) {
  write(join(site, 'content', `${page.path}.md`), `${tools.toAgentMarkdown(page, 'site')}\n`);
}
const index = {
  pages: pages.map(({ path, title, description }) => ({ path, title, description })),
  sidebar: tools.sidebar(pages.filter((page) => !page.path.startsWith('errors/'))),
};
write(join(site, 'content', 'pages.json'), `${JSON.stringify(index, null, 2)}\n`);
for (const [name, text] of Object.entries(tools.llms(pages))) {
  write(join(site, 'ui', 'public', 'v0', name), text);
}
rmSync(work, { recursive: true, force: true });
console.log(`synced ${pages.length} pages from ${root}`);
