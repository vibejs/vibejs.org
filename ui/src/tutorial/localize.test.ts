import { expect, it } from 'vitest';
import { localizeFiles, PHRASES } from './localize.ts';
import { STEPS } from './steps.ts';

const all = STEPS.flatMap((step) => [step.files, step.solution]);
const text = (files: Record<string, string>[]) => files.flatMap((f) => Object.values(f)).join('\n');

it('matches every phrase in the lessons, so none stays English by accident', () => {
  const source = text(all);
  const missing = PHRASES.map(([en]) => en).filter((en) => !source.includes(en));
  expect(missing).toEqual([]);
});

it('translates what the apps show and leaves English unchanged', () => {
  for (const locale of ['tr', 'ar'] as const) {
    const out = text(all.map((files) => localizeFiles(files, locale)));
    expect(PHRASES.map(([en]) => en).filter((en) => out.includes(en))).toEqual([]);
  }
  expect(localizeFiles(STEPS[0]!.files, 'en')).toBe(STEPS[0]!.files);
});
