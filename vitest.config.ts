import { vibe } from '@usevibejs/compiler/vite';
import { defineConfig } from 'vitest/config';
import { markdown } from './build/markdown.ts';

export default defineConfig({
  plugins: [vibe(), markdown()],
  test: {
    name: 'ui',
    environment: 'jsdom',
    include: ['ui/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['ui/src/**/*.{ts,vibe}'],
      exclude: ['**/*.test.ts', '**/*.d.ts', 'ui/src/main.ts'],
    },
  },
});
