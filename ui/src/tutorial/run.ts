import * as contract from '@usevibejs/contract';
import * as ui from '@usevibejs/ui';
import type { App } from '@usevibejs/ui';
import * as internal from '@usevibejs/ui/internal';
import * as router from '@usevibejs/ui/router';
import * as valibot from 'valibot';

// The tutorial's code runs on the same vibe.js runtime as this page. Each import of a library
// resolves to a small module that re-exports it from this global.
const LIBRARIES: Record<string, Record<string, unknown>> = {
  '@usevibejs/ui': ui,
  '@usevibejs/ui/internal': internal,
  '@usevibejs/ui/router': router,
  '@usevibejs/contract': contract,
  valibot,
};

/** The current run: where `mount('#app')` renders, and the apps to unmount later. */
interface Session {
  target: HTMLElement;
  apps: App[];
  onError: (error: unknown) => void;
}
let session: Session | undefined;

/**
 * `createApp` for the tutorial's code: `mount('#app')` renders into the preview instead of this
 * page, and errors reach the preview's error panel.
 */
function createApp(...args: Parameters<typeof ui.createApp>): App {
  const app = ui.createApp(...args);
  const current = session!;
  const mount = app.mount.bind(app);
  app.mount = ((selector: unknown) =>
    mount(typeof selector === 'string' ? current.target : (selector as Element))) as App['mount'];
  app.config.errorHandler = (error) => current.onError(error);
  current.apps.push(app);
  return app;
}
(globalThis as Record<string, unknown>).__vibeTutorial = { ...LIBRARIES, createApp };

const shims = new Map<string, string>();
function shimUrl(specifier: string): string {
  let url = shims.get(specifier);
  if (!url) {
    // Exported by string name, so names that are reserved words (valibot's `enum`) still work.
    const names = Object.keys(LIBRARIES[specifier]!).filter((name) => name !== 'default');
    const code = [
      `const m = globalThis.__vibeTutorial[${JSON.stringify(specifier)}];`,
      ...names.map((name, i) =>
        // Looked up per call, so each run's createApp mounts into that run's preview.
        specifier === '@usevibejs/ui' && name === 'createApp'
          ? `const _${i} = (...args) => globalThis.__vibeTutorial.createApp(...args);`
          : `const _${i} = m[${JSON.stringify(name)}];`,
      ),
      `export { ${names.map((name, i) => `_${i} as ${JSON.stringify(name)}`).join(', ')} };`,
    ].join('\n');
    url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    shims.set(specifier, url);
  }
  return url;
}

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"]+)\2/g;
// Global styles are collected by the compile step; their import statements have nothing to load.
const CSS_IMPORT = /^\s*import\s*(['"])\.\/[^'"]+\.css\1;?\s*$/gm;

/** A running preview: stop it before the next one starts. */
export interface Running {
  stop(): void;
}

/**
 * Runs a step: `main.ts` when the step has one, otherwise `App.vibe` mounted as the root component.
 * Errors from the step's code reach `onError`, a missing import included.
 */
export async function run(
  modules: Record<string, string>,
  target: HTMLElement,
  onError: (error: unknown) => void,
): Promise<Running> {
  const urls = new Map<string, string>();
  const urlOf = (name: string, from: string[]): string => {
    const cached = urls.get(name);
    if (cached) return cached;
    if (from.includes(name))
      throw new Error(`${[...from, name].join(' → ')}: the files import each other in a loop.`);
    const code = modules[name];
    if (code === undefined) throw new Error(`There is no file ${name}.`);
    const rewritten = code
      .replace(CSS_IMPORT, '')
      .replace(SPECIFIER, (_all, keyword: string, quote: string, specifier: string) => {
        if (specifier in LIBRARIES) return `${keyword}${quote}${shimUrl(specifier)}${quote}`;
        if (specifier.startsWith('./')) {
          return `${keyword}${quote}${urlOf(specifier.slice(2), [...from, name])}${quote}`;
        }
        throw new Error(
          `${name} imports ${specifier}; the tutorial knows @usevibejs/ui, @usevibejs/contract, valibot and ./ files.`,
        );
      });
    const url = URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }));
    urls.set(name, url);
    return url;
  };

  const current: Session = { target, apps: [], onError };
  session = current;
  try {
    if ('main.ts' in modules) {
      await import(/* @vite-ignore */ urlOf('main.ts', []));
    } else {
      const module = (await import(/* @vite-ignore */ urlOf('App.vibe', []))) as {
        default: Parameters<typeof ui.createApp>[0];
      };
      createApp(module.default).mount('#app');
    }
  } catch (error) {
    onError(error);
  }
  return {
    stop() {
      for (const app of current.apps) app.unmount();
      for (const url of urls.values()) URL.revokeObjectURL(url);
    },
  };
}
