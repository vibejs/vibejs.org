import { expect, it } from 'vitest';
import { titleOf } from './routes.ts';

it('titles the home page, docs pages and missing pages', () => {
  expect(titleOf('/')).toBe('vibe.js: if it compiles, both sides agree');
  expect(titleOf('/v0/')).toBe('vibe.js | vibe.js');
  expect(titleOf('/v0/ui/routing#routes')).toBe('Routing | vibe.js');
  expect(titleOf('/v0/nope')).toBe('Page not found | vibe.js');
});
