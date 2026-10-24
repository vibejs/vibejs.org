import { compile, compileStyle } from '@usevibejs/compiler';
import { transform } from 'sucrase';

/** One problem in a file, with a 1-based line and column when the compiler knows them. */
export interface Problem {
  file: string;
  message: string;
  line?: number;
  column?: number;
}

export interface Compiled {
  /** Plain JavaScript per file name, still importing `@usevibejs/ui` and sibling `.vibe` files. */
  modules: Record<string, string>;
  css: string;
  problems: Problem[];
}

/** The 8-hex scope id of a file, stable across compiles so styles and markup keep matching. */
function scopeId(name: string): string {
  let hash = 0x811c9dc5;
  for (const char of name) hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Compiles a step's `.vibe` files with the vibe.js compiler and strips the types of its `.ts` files. */
export function compileFiles(files: Record<string, string>): Compiled {
  const modules: Record<string, string> = {};
  const css: string[] = [];
  const problems: Problem[] = [];
  for (const [name, source] of Object.entries(files)) {
    // Global styles: the preview applies them as they are, like a CSS import in an app.
    if (name.endsWith('.css')) {
      css.push(source);
      continue;
    }
    if (name.endsWith('.ts')) {
      try {
        modules[name] = transform(source, {
          transforms: ['typescript'],
          disableESTransforms: true,
        }).code;
      } catch (error) {
        problems.push({ file: name, message: String((error as Error).message ?? error) });
      }
      continue;
    }
    const id = scopeId(name);
    const result = compile(source, { filename: name, id, dev: false });
    for (const d of result.diagnostics) {
      problems.push({
        file: name,
        message: `${d.code}: ${d.message}`,
        line: d.start.line,
        column: d.start.column,
      });
    }
    if (!result.code) continue;
    try {
      modules[name] = transform(result.code, {
        transforms: ['typescript'],
        disableESTransforms: true,
      }).code;
    } catch (error) {
      problems.push({ file: name, message: String((error as Error).message ?? error) });
    }
    result.styles.forEach(({ index, scoped }) => {
      const block = result.descriptor.styles[index]!;
      if (!scoped) return void css.push(block.content);
      const style = compileStyle(block.content, { filename: name, id });
      for (const d of style.diagnostics)
        problems.push({ file: name, message: `${d.code}: ${d.message}` });
      css.push(style.code);
    });
  }
  return { modules, css: css.join('\n'), problems };
}
