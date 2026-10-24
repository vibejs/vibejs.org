import tailwindcss from '@tailwindcss/vite';
import { vibe } from '@usevibejs/compiler/vite';
import { defineConfig } from 'vite';
import { markdown } from '../build/markdown.ts';

const path = (relative: string) => decodeURIComponent(new URL(relative, import.meta.url).pathname);

export default defineConfig({
  plugins: [vibe(), markdown(), tailwindcss()],
  resolve: {
    alias: [
      // The tutorial compiles .vibe files in the browser, with the WebAssembly build of the parser.
      { find: /^oxc-parser$/, replacement: path('../build/oxc-parser-browser.js') },
      // postcss turns source maps off in browsers, but the compiler's compileStyle reads one.
      { find: /^source-map-js$/, replacement: path('../node_modules/source-map-js/source-map.js') },
      { find: /^path$/, replacement: path('../build/path-browser.js') },
    ],
  },
  // The tutorial's in-browser compiler is one large chunk, loaded only on /tutorial.
  build: { target: 'es2022', chunkSizeWarningLimit: 1600 },
  optimizeDeps: { exclude: ['@oxc-parser/binding-wasm32-wasip1'] },
  // Lets a sandboxed preview use a fresh cache folder; Vite's default otherwise.
  cacheDir: process.env.VITE_CACHE_DIR,
  // The docs content lives next to ui/, in content/.
  server: { fs: { allow: ['..'] } },
});
