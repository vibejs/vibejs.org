import { createMemoryHistory, createRouter } from '@usevibejs/ui/router';
import { flushPromises, mount } from '@usevibejs/ui/testing';
import { expect, it, vi } from 'vitest';
import App from './App.vibe';
import { routes } from './routes.ts';

async function render(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  const wrapper = mount(App, { plugins: [router] });
  await router.push(path);
  await flushPromises();
  return { wrapper, router };
}

it('renders the home page with the live counter', async () => {
  const { wrapper } = await render('/');
  expect(wrapper.get('h1').text()).toBe('If it compiles, both sides agree.');
  const button = wrapper.findAll('button').find((b) => b.text().startsWith('Tapped'))!;
  await button.trigger('click');
  expect(button.text()).toBe('Tapped 1 times');
  const packages = wrapper.findAll('a').map((a) => a.attributes('href'));
  expect(packages).toContain('https://query.vibejs.org');
});

it('renders a docs page and its title', async () => {
  const { wrapper } = await render('/v0/ui/routing');
  // The page chunk loads after the navigation; wait for it to render.
  await vi.waitFor(() => expect(wrapper.get('.doc h1').text()).toBe('Routing'), {
    timeout: 10_000,
  });
});

it('shows a not-found page for unknown paths', async () => {
  const { wrapper } = await render('/nope');
  expect(wrapper.get('h1').text()).toBe('This page does not exist.');
});
