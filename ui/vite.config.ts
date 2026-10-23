import tailwindcss from '@tailwindcss/vite';
import { vibe } from '@usevibejs/compiler/vite';
import { defineConfig } from 'vite';
import { markdown } from '../build/markdown.ts';

export default defineConfig({
  plugins: [vibe(), markdown(), tailwindcss()],
  // Lets a sandboxed preview use a fresh cache folder; Vite's default otherwise.
  cacheDir: process.env.VITE_CACHE_DIR,
  // The docs content lives next to ui/, in content/.
  server: { fs: { allow: ['..'] } },
});
