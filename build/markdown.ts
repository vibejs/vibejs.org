import { readFileSync } from 'node:fs';
import { Marked, type Tokens } from 'marked';
import { createHighlighter, type Highlighter, type LanguageRegistration } from 'shiki';
import type { Plugin } from 'vite';
import type { DocModule, Heading } from '../ui/src/docs.ts';

const SITE = 'https://vibejs.org/v0/';
const LANGS = [
  'typescript',
  'js',
  'json',
  'sh',
  'html',
  'html-derivative',
  'css',
  'scss',
  'less',
  'md',
  'yaml',
  'diff',
  'jsonc',
];
const ALIASES: Record<string, string> = { vibejs: 'vibe', bash: 'sh', shell: 'sh', console: 'sh' };
const THEMES = { light: 'github-light-default', dark: 'github-dark-default' } as const;

/** The `.vibe` grammars of the vibe.js VS Code extension, so code here looks as it does there. */
function vibeGrammars(): LanguageRegistration[] {
  const read = (name: string) =>
    JSON.parse(
      readFileSync(new URL(`./grammars/${name}.tmLanguage.json`, import.meta.url), 'utf8'),
    );
  return [
    {
      ...read('vibejs'),
      name: 'vibe',
      embeddedLangs: ['typescript', 'css', 'scss', 'less', 'html', 'html-derivative'],
    },
    { ...read('vibejs-directives'), name: 'vibejs-directives', injectTo: ['source.vibejs'] },
    {
      ...read('vibejs-interpolations'),
      name: 'vibejs-interpolations',
      injectTo: ['source.vibejs'],
    },
  ];
}

const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const escape = (text: string): string =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Renders one docs page; site links become paths, so the router handles them. */
export function render(markdown: string, highlighter: Highlighter): DocModule {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        const base = slug(html) || 'section';
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count ? `${base}-${count}` : base;
        if (depth === 2 || depth === 3)
          headings.push({ depth, id, text: html.replace(/<[^>]+>/g, '') });
        if (depth === 1) return `<h1>${html}</h1>\n`;
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}">${html}</a></h${depth}>\n`;
      },
      code({ text, lang }: Tokens.Code) {
        const name = (lang ?? '').split(/\s/)[0];
        const language = ALIASES[name] ?? name;
        const label = name ? `<span class="code-lang">${escape(name)}</span>` : '';
        const body = highlighter.getLoadedLanguages().includes(language)
          ? highlighter.codeToHtml(text, {
              lang: language,
              themes: THEMES,
              defaultColor: false,
            })
          : `<pre class="shiki"><code>${escape(text)}</code></pre>`;
        return `<div class="code code-block">${label}${body}</div>\n`;
      },
    },
  });
  // Tables scroll sideways on their own, so a wide one never widens the page on a phone.
  const html = (marked.parse(markdown) as string)
    .replaceAll(`href="${SITE}`, 'href="/v0/')
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>');
  return { html, headings };
}

/** Turns `*.md` imports into `{ html, headings }` modules, highlighted at build time. */
export function markdown(): Plugin {
  let highlighter: Promise<Highlighter> | undefined;
  return {
    name: 'vibejs-site-markdown',
    async transform(code, id) {
      if (!id.endsWith('.md')) return null;
      highlighter ??= createHighlighter({
        themes: Object.values(THEMES),
        langs: [...LANGS, ...vibeGrammars()],
      });
      return {
        code: `export default ${JSON.stringify(render(code, await highlighter))};`,
        map: null,
      };
    },
  };
}
