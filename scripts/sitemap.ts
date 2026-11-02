// Regenerates ui/public/sitemap.xml from content/pages.json, locales and tutorial steps.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STEPS } from '../ui/src/tutorial/steps.ts';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://vibejs.org';
const LOCALES = ['en', 'tr', 'ar'] as const;

interface Index {
  pages: { path: string }[];
}

const index = JSON.parse(readFileSync(join(site, 'content/pages.json'), 'utf8')) as Index;

function prefixed(path: string, locale: (typeof LOCALES)[number]): string {
  if (locale === 'en') return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

function docsPath(pagePath: string): string {
  if (pagePath === 'index') return '/v0/';
  if (pagePath.endsWith('/index')) return `/v0/${pagePath.slice(0, -'/index'.length)}/`;
  return `/v0/${pagePath}`;
}

const barePaths = [
  '/',
  '/tutorial',
  ...STEPS.map((step) => `/tutorial/${step.slug}`),
  ...index.pages.map((page) => docsPath(page.path)),
];

function entry(path: string): string {
  const alternates = LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${ORIGIN}${prefixed(path, locale)}"/>`,
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${path}"/>`;
  return LOCALES.map((locale) => {
    const loc = `${ORIGIN}${prefixed(path, locale)}`;
    return `  <url>\n    <loc>${loc}</loc>\n${alternates}\n${xDefault}\n  </url>`;
  }).join('\n');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${barePaths.map(entry).join('\n')}
</urlset>
`;

writeFileSync(join(site, 'ui/public/sitemap.xml'), xml);
console.log(`wrote sitemap with ${barePaths.length} paths × ${LOCALES.length} locales`);
