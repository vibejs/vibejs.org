import { expect, it, vi } from 'vitest';
import { preferredLocale } from './i18n.ts';

it('keeps English when the visitor has not chosen a language', () => {
  vi.stubGlobal('navigator', { language: 'tr-TR', languages: ['tr-TR', 'tr', 'en'] });
  expect(preferredLocale()).toBe('en');
});

it('honors an explicit language-picker choice from storage', () => {
  localStorage.setItem('locale', 'tr');
  expect(preferredLocale()).toBe('tr');
  localStorage.removeItem('locale');
});
