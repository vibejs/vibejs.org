/** One lesson: what to read, the files to start from and the files of a solution. */
export interface Step {
  slug: string;
  title: string;
  /** Short HTML: a paragraph or two and the task. Our own text, so it is rendered as is. */
  body: string;
  files: Record<string, string>;
  solution: Record<string, string>;
}

const vibe = (script: string, template: string, style = '') =>
  `<script setup lang="ts">\n${script.trim()}\n</script>\n\n<template>\n${template.trim()}\n</template>\n${style ? `\n<style scoped>\n${style.trim()}\n</style>\n` : ''}`;

const BASICS_AND_COMPONENTS: Step[] = [
  {
    slug: 'components',
    title: 'Your first component',
    body: `<p>A <code>.vibe</code> file is one component: a <code>&lt;script setup&gt;</code> in TypeScript and a <code>&lt;template&gt;</code> with the markup. Everything the script declares is usable in the template, and <code>{{ }}</code> prints a value.</p>
<p><strong>Try it:</strong> change <code>name</code> to your own name. The preview updates as you type.</p>`,
    files: {
      'App.vibe': vibe(`const name = 'vibe.js';`, `<h1>Hello, {{ name }}!</h1>`),
    },
    solution: {
      'App.vibe': vibe(`const name = 'Ada';`, `<h1>Hello, {{ name }}!</h1>`),
    },
  },
  {
    slug: 'reactivity',
    title: 'Reactive state',
    body: `<p><code>ref()</code> makes a value reactive: when it changes, the text that reads it updates, and nothing else re-renders. <code>@click</code> runs code on a click. In the template a ref reads as its value; in the script, use <code>.value</code>.</p>
<p><strong>Try it:</strong> add a <em>Reset</em> button that sets <code>count</code> back to 0.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nconst count = ref(0);`,
        `<button @click="count++">Clicked {{ count }} times</button>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nconst count = ref(0);\n\nfunction reset() {\n  count.value = 0;\n}`,
        `<button @click="count++">Clicked {{ count }} times</button>\n<button @click="reset">Reset</button>`,
      ),
    },
  },
  {
    slug: 'computed',
    title: 'Computed values',
    body: `<p><code>computed()</code> derives a value from other reactive values. It recalculates only when one of them changes, and its result is cached in between.</p>
<p><strong>Try it:</strong> add a computed <code>isEven</code> and show “even” or “odd” next to the number.</p>`,
    files: {
      'App.vibe': vibe(
        `import { computed, ref } from '@usevibejs/ui';\n\nconst count = ref(1);\nconst double = computed(() => count.value * 2);`,
        `<button @click="count++">Add one</button>\n<p>{{ count }} doubled is {{ double }}.</p>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { computed, ref } from '@usevibejs/ui';\n\nconst count = ref(1);\nconst double = computed(() => count.value * 2);\nconst isEven = computed(() => count.value % 2 === 0);`,
        `<button @click="count++">Add one</button>\n<p>{{ count }} doubled is {{ double }}. {{ count }} is {{ isEven ? 'even' : 'odd' }}.</p>`,
      ),
    },
  },
  {
    slug: 'lists',
    title: 'Conditionals and lists',
    body: `<p><code>v-if</code> and <code>v-else</code> render one branch or the other. <code>v-for</code> renders an element per item; every item needs a stable <code>:key</code>.</p>
<p><strong>Try it:</strong> when there are no todos, show “Nothing to do.” instead of the list. Click <em>Clear</em> to check.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nconst todos = ref([\n  { id: 1, title: 'Read the docs' },\n  { id: 2, title: 'Build something' },\n]);`,
        `<ul>\n  <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>\n</ul>\n<button @click="todos = []">Clear</button>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nconst todos = ref([\n  { id: 1, title: 'Read the docs' },\n  { id: 2, title: 'Build something' },\n]);`,
        `<ul v-if="todos.length">\n  <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>\n</ul>\n<p v-else>Nothing to do.</p>\n<button @click="todos = []">Clear</button>`,
      ),
    },
  },
  {
    slug: 'forms',
    title: 'Forms',
    body: `<p><code>v-model</code> binds an input to a ref in both directions. <code>@submit.prevent</code> handles a form without reloading the page.</p>
<p><strong>Try it:</strong> make <em>Add</em> push the typed title into <code>todos</code> and clear the input.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nlet nextId = 1;\nconst title = ref('');\nconst todos = ref<{ id: number; title: string }[]>([]);\n\nfunction add() {\n  // Your code here\n}`,
        `<form @submit.prevent="add">\n  <input v-model="title" placeholder="What next?" />\n  <button>Add</button>\n</form>\n<ul>\n  <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>\n</ul>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nlet nextId = 1;\nconst title = ref('');\nconst todos = ref<{ id: number; title: string }[]>([]);\n\nfunction add() {\n  if (!title.value.trim()) return;\n  todos.value.push({ id: nextId++, title: title.value });\n  title.value = '';\n}`,
        `<form @submit.prevent="add">\n  <input v-model="title" placeholder="What next?" />\n  <button>Add</button>\n</form>\n<ul>\n  <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>\n</ul>`,
      ),
    },
  },
  {
    slug: 'props',
    title: 'Components and props',
    body: `<p>Import another <code>.vibe</code> file to use it as a tag. <code>defineProps</code> declares what it accepts, with types the compiler checks in every template that uses it.</p>
<p><strong>Try it:</strong> open <code>TodoItem.vibe</code> and add a <code>done</code> prop; pass it from <code>App.vibe</code> and show ✓ when it is true.</p>`,
    files: {
      'App.vibe': vibe(
        `import TodoItem from './TodoItem.vibe';`,
        `<ul>\n  <TodoItem title="Read the docs" />\n  <TodoItem title="Build something" />\n</ul>`,
      ),
      'TodoItem.vibe': vibe(
        `const { title } = defineProps<{ title: string }>();`,
        `<li>{{ title }}</li>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import TodoItem from './TodoItem.vibe';`,
        `<ul>\n  <TodoItem title="Read the docs" :done="true" />\n  <TodoItem title="Build something" :done="false" />\n</ul>`,
      ),
      'TodoItem.vibe': vibe(
        `const { title, done = false } = defineProps<{ title: string; done?: boolean }>();`,
        `<li>{{ title }} <span v-if="done">✓</span></li>`,
      ),
    },
  },
  {
    slug: 'events',
    title: 'Events',
    body: `<p>A child tells its parent that something happened by emitting an event. <code>defineEmits</code> declares the events and their payloads; the parent listens with <code>@</code>.</p>
<p><strong>Try it:</strong> make the <em>Remove</em> button emit <code>remove</code>, and remove the todo in <code>App.vibe</code>.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\nimport TodoItem from './TodoItem.vibe';\n\nconst todos = ref([\n  { id: 1, title: 'Read the docs' },\n  { id: 2, title: 'Build something' },\n]);\n\nfunction remove(id: number) {\n  todos.value = todos.value.filter((todo) => todo.id !== id);\n}`,
        `<ul>\n  <TodoItem v-for="todo in todos" :key="todo.id" :title="todo.title" />\n</ul>`,
      ),
      'TodoItem.vibe': vibe(
        `const { title } = defineProps<{ title: string }>();\nconst emit = defineEmits<{ remove: [] }>();`,
        `<li>{{ title }} <button>Remove</button></li>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\nimport TodoItem from './TodoItem.vibe';\n\nconst todos = ref([\n  { id: 1, title: 'Read the docs' },\n  { id: 2, title: 'Build something' },\n]);\n\nfunction remove(id: number) {\n  todos.value = todos.value.filter((todo) => todo.id !== id);\n}`,
        `<ul>\n  <TodoItem v-for="todo in todos" :key="todo.id" :title="todo.title" @remove="remove(todo.id)" />\n</ul>`,
      ),
      'TodoItem.vibe': vibe(
        `const { title } = defineProps<{ title: string }>();\nconst emit = defineEmits<{ remove: [] }>();`,
        `<li>{{ title }} <button @click="emit('remove')">Remove</button></li>`,
      ),
    },
  },
  {
    slug: 'styles',
    title: 'Scoped styles',
    body: `<p><code>&lt;style scoped&gt;</code> applies only to this component’s markup. <code>:class</code> toggles classes from state.</p>
<p><strong>Try it:</strong> give the item the <code>done</code> class when <code>done</code> is true, so a click strikes it through.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nconst done = ref(false);`,
        `<p class="item" @click="done = !done">Ship v0.1</p>`,
        `.item {\n  cursor: pointer;\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n}\n.done {\n  text-decoration: line-through;\n  opacity: 0.5;\n}`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\n\nconst done = ref(false);`,
        `<p :class="['item', { done }]" @click="done = !done">Ship v0.1</p>`,
        `.item {\n  cursor: pointer;\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n}\n.done {\n  text-decoration: line-through;\n  opacity: 0.5;\n}`,
      ),
    },
  },
];

const STYLE_CARD = `.card {
  border: 1px solid #8884;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
}
h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
}`;

const CONTRACT = `import { defineContract, get } from '@usevibejs/contract';
import * as v from 'valibot';

export const Todo = v.object({ id: v.number(), title: v.string(), done: v.boolean() });

// Each route once: its path, its response and the errors it can return.
export const todos = defineContract('/todos', {
  list: get('/', { response: v.array(Todo) }),
  one: get('/:id', { response: Todo, errors: { TODO_NOT_FOUND: 404 } }),
});
`;

const SERVER = `// A stand-in for the server, so this step runs in your browser. In an app, a controller
// handles the same contract on the server.
const todos = [
  { id: 1, title: 'Read the docs', done: true },
  { id: 2, title: 'Build something', done: false },
];

export async function server(input: RequestInfo | URL): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const path = new URL(input instanceof Request ? input.url : String(input), location.origin).pathname;
  if (path === '/api/todos') return Response.json(todos);
  const todo = todos.find((t) => \`/api/todos/\${t.id}\` === path);
  if (todo) return Response.json(todo);
  return new Response(
    JSON.stringify({ title: 'Not Found', status: 404, code: 'TODO_NOT_FOUND', detail: \`No todo at \${path}\` }),
    { status: 404, headers: { 'content-type': 'application/problem+json' } },
  );
}
`;

const MORE: Step[] = [
  {
    slug: 'slots',
    title: 'Slots',
    body: `<p>A component can take markup from its parent. <code>&lt;slot&gt;</code> marks where it goes; named slots take a <code>name</code>, and the parent fills them with <code>&lt;template #name&gt;</code>.</p>
<p><strong>Try it:</strong> give the <code>title</code> slot the fallback “Untitled”, then add a third card without a title.</p>`,
    files: {
      'App.vibe': vibe(
        `import Card from './Card.vibe';`,
        `<Card>\n  <template #title>Contracts</template>\n  Routes typed once, for both sides.\n</Card>\n<Card>\n  <template #title>Templates</template>\n  Checked like any TypeScript.\n</Card>`,
      ),
      'Card.vibe': vibe(
        ``,
        `<section class="card">\n  <h2><slot name="title" /></h2>\n  <slot />\n</section>`,
        STYLE_CARD,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import Card from './Card.vibe';`,
        `<Card>\n  <template #title>Contracts</template>\n  Routes typed once, for both sides.\n</Card>\n<Card>\n  <template #title>Templates</template>\n  Checked like any TypeScript.\n</Card>\n<Card>A card without a title.</Card>`,
      ),
      'Card.vibe': vibe(
        ``,
        `<section class="card">\n  <h2><slot name="title">Untitled</slot></h2>\n  <slot />\n</section>`,
        STYLE_CARD,
      ),
    },
  },
  {
    slug: 'watchers',
    title: 'Watchers',
    body: `<p><code>watch()</code> runs code when a reactive value changes, with the new and the old value. Use it for side effects, such as saving, logging or calling an API.</p>
<p><strong>Try it:</strong> save <code>name</code> to <code>localStorage</code> in the watcher and read it back when the component starts. Reload the preview by editing the code: the name stays.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref, watch } from '@usevibejs/ui';\n\nconst name = ref('');\nconst changes = ref(0);\n\nwatch(name, () => {\n  changes.value++;\n});`,
        `<input v-model="name" placeholder="Your name" />\n<p>Hello, {{ name || 'stranger' }}. Changed {{ changes }} times.</p>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref, watch } from '@usevibejs/ui';\n\nconst name = ref(localStorage.getItem('name') ?? '');\nconst changes = ref(0);\n\nwatch(name, (value) => {\n  changes.value++;\n  localStorage.setItem('name', value);\n});`,
        `<input v-model="name" placeholder="Your name" />\n<p>Hello, {{ name || 'stranger' }}. Changed {{ changes }} times.</p>`,
      ),
    },
  },
  {
    slug: 'lifecycle',
    title: 'Lifecycle and template refs',
    body: `<p><code>onMounted</code> runs once the component is in the page; <code>onBeforeUnmount</code> runs before it leaves, so it can undo what <code>onMounted</code> set up. <code>useTemplateRef</code> gives you the element with a matching <code>ref</code>.</p>
<p><strong>Try it:</strong> show the window width and keep it current: add a <code>resize</code> listener in <code>onMounted</code> and remove it in <code>onBeforeUnmount</code>.</p>`,
    files: {
      'App.vibe': vibe(
        `import { onMounted, ref, useTemplateRef } from '@usevibejs/ui';\n\nconst input = useTemplateRef<HTMLInputElement>('input');\nconst width = ref(0);\n\nonMounted(() => {\n  input.value?.focus();\n});`,
        `<input ref="input" placeholder="I have focus" />\n<p>The window is {{ width }}px wide.</p>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { onBeforeUnmount, onMounted, ref, useTemplateRef } from '@usevibejs/ui';\n\nconst input = useTemplateRef<HTMLInputElement>('input');\nconst width = ref(window.innerWidth);\nconst measure = () => (width.value = window.innerWidth);\n\nonMounted(() => {\n  input.value?.focus();\n  window.addEventListener('resize', measure);\n});\nonBeforeUnmount(() => window.removeEventListener('resize', measure));`,
        `<input ref="input" placeholder="I have focus" />\n<p>The window is {{ width }}px wide.</p>`,
      ),
    },
  },
  {
    slug: 'loading-data',
    title: 'Loading data',
    body: `<p><code>useAsync()</code> runs an async function when the component mounts and gives you <code>data</code>, <code>error</code>, <code>loading</code> and <code>refresh()</code>. It aborts a run that is no longer needed through the <code>signal</code> it passes in.</p>
<p><strong>Try it:</strong> show “Loading…” while it runs, and add a <em>Roll again</em> button that calls <code>refresh()</code>.</p>`,
    files: {
      'App.vibe': vibe(
        `import { useAsync } from '@usevibejs/ui';\n\n// Pretends to be a slow request.\nasync function roll(): Promise<number> {\n  await new Promise((resolve) => setTimeout(resolve, 800));\n  return 1 + Math.floor(Math.random() * 6);\n}\n\nconst { data } = useAsync(() => roll());`,
        `<p>You rolled {{ data }}.</p>`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { useAsync } from '@usevibejs/ui';\n\n// Pretends to be a slow request.\nasync function roll(): Promise<number> {\n  await new Promise((resolve) => setTimeout(resolve, 800));\n  return 1 + Math.floor(Math.random() * 6);\n}\n\nconst { data, loading, refresh } = useAsync(() => roll());`,
        `<p v-if="loading">Loading…</p>\n<p v-else>You rolled {{ data }}.</p>\n<button :disabled="loading" @click="refresh()">Roll again</button>`,
      ),
    },
  },
  {
    slug: 'contracts',
    title: 'Typed contracts',
    body: `<p>This is what makes vibe.js full-stack. <code>contract.ts</code> declares each route once. The server handles it, and <code>createClient</code> gives the UI a function per route, typed from the same contract: a renamed field is a type error on both sides. A call never throws; it returns <code>{ ok: true, data }</code> or <code>{ ok: false, error }</code>.</p>
<p><strong>Try it:</strong> load the todo with id 3 through <code>api.todos.one</code> and show its title, or “Not found” when <code>error.code</code> is <code>TODO_NOT_FOUND</code>.</p>`,
    files: {
      'App.vibe': vibe(
        `import { createClient } from '@usevibejs/contract';\nimport { computed, useAsync } from '@usevibejs/ui';\nimport { todos } from './contract.ts';\nimport { server } from './server.ts';\n\nconst api = createClient({ todos }, { baseUrl: '/api', fetch: server });\n\nconst { data } = useAsync((signal) => api.todos.list(undefined, { signal }));\nconst list = computed(() => (data.value?.ok ? data.value.data : []));`,
        `<ul>\n  <li v-for="todo in list" :key="todo.id">{{ todo.title }} {{ todo.done ? '✓' : '' }}</li>\n</ul>`,
      ),
      'contract.ts': CONTRACT,
      'server.ts': SERVER,
    },
    solution: {
      'App.vibe': vibe(
        `import { createClient } from '@usevibejs/contract';\nimport { computed, useAsync } from '@usevibejs/ui';\nimport { todos } from './contract.ts';\nimport { server } from './server.ts';\n\nconst api = createClient({ todos }, { baseUrl: '/api', fetch: server });\n\nconst { data } = useAsync((signal) => api.todos.list(undefined, { signal }));\nconst list = computed(() => (data.value?.ok ? data.value.data : []));\n\nconst three = useAsync((signal) => api.todos.one({ params: { id: '3' } }, { signal }));\nconst third = computed(() => {\n  const result = three.data.value;\n  if (!result) return 'Loading…';\n  if (result.ok) return result.data.title;\n  return result.error.code === 'TODO_NOT_FOUND' ? 'Not found' : result.error.code;\n});`,
        `<ul>\n  <li v-for="todo in list" :key="todo.id">{{ todo.title }} {{ todo.done ? '✓' : '' }}</li>\n</ul>\n<p>Todo 3: {{ third }}</p>`,
      ),
      'contract.ts': CONTRACT,
      'server.ts': SERVER,
    },
  },
];

const MAIN = (extra = '') =>
  `import { createApp } from '@usevibejs/ui';\nimport App from './App.vibe';\n${extra}\ncreateApp(App).mount('#app');\n`;

const ROUTER_MAIN = `import { createApp } from '@usevibejs/ui';
import { createMemoryHistory, createRouter, defineRoutes } from '@usevibejs/ui/router';
import App from './App.vibe';
import HomePage from './HomePage.vibe';
import UserPage from './UserPage.vibe';

const routes = defineRoutes([
  { path: '/', name: 'home', component: HomePage },
  { path: '/users/:id', name: 'user', component: UserPage },
]);

// The preview keeps its URL in memory; an app uses createWebHistory().
const router = createRouter({ history: createMemoryHistory(), routes });

createApp(App).use(router).mount('#app');
`;

const APP_MORE: Step[] = [
  {
    slug: 'global-styles',
    title: 'main.ts and global styles',
    body: `<p>An app starts in <code>main.ts</code>: it creates the app from the root component and mounts it. That is also where global CSS comes in, with a plain <code>import './styles.css'</code>. Global rules apply everywhere; <code>&lt;style scoped&gt;</code> stays inside its component.</p>
<p><strong>Try it:</strong> import <code>styles.css</code> in <code>main.ts</code>, then change <code>--accent</code> in it and watch both the heading and the button follow.</p>`,
    files: {
      'main.ts': MAIN(),
      'App.vibe': vibe(``, `<h1>Global styles</h1>\n<button class="primary">A button</button>`),
      'styles.css': `:root {\n  --accent: #111;\n}\nh1 {\n  color: var(--accent);\n}\n.primary {\n  background: var(--accent);\n  color: white;\n  border: 0;\n}\n`,
    },
    solution: {
      'main.ts': MAIN(`import './styles.css';\n`),
      'App.vibe': vibe(``, `<h1>Global styles</h1>\n<button class="primary">A button</button>`),
      'styles.css': `:root {\n  --accent: #7c3aed;\n}\nh1 {\n  color: var(--accent);\n}\n.primary {\n  background: var(--accent);\n  color: white;\n  border: 0;\n}\n`,
    },
  },
  {
    slug: 'v-model',
    title: 'v-model on components',
    body: `<p><code>defineModel()</code> gives a component a two-way value: reading it reads the parent's value, assigning it updates the parent. The parent binds it with <code>v-model</code>, as on an input.</p>
<p><strong>Try it:</strong> make clicking the switch flip <code>on</code>, so the text in <code>App.vibe</code> follows.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\nimport Toggle from './Toggle.vibe';\n\nconst notifications = ref(false);`,
        `<Toggle v-model="notifications" />\n<p>Notifications are {{ notifications ? 'on' : 'off' }}.</p>`,
      ),
      'Toggle.vibe': vibe(
        `const on = defineModel<boolean>({ required: true });`,
        `<button :class="['switch', { on }]">{{ on ? 'On' : 'Off' }}</button>`,
        `.switch {\n  min-width: 64px;\n}\n.on {\n  background: #111;\n  color: white;\n}`,
      ),
    },
    solution: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\nimport Toggle from './Toggle.vibe';\n\nconst notifications = ref(false);`,
        `<Toggle v-model="notifications" />\n<p>Notifications are {{ notifications ? 'on' : 'off' }}.</p>`,
      ),
      'Toggle.vibe': vibe(
        `const on = defineModel<boolean>({ required: true });`,
        `<button :class="['switch', { on }]" @click="on = !on">{{ on ? 'On' : 'Off' }}</button>`,
        `.switch {\n  min-width: 64px;\n}\n.on {\n  background: #111;\n  color: white;\n}`,
      ),
    },
  },
  {
    slug: 'provide-inject',
    title: 'Provide and inject',
    body: `<p><code>provide()</code> makes a value available to every component below; <code>inject()</code> reads it, however deep, without passing props through each level. An <code>InjectionKey</code> carries the value's type.</p>
<p><strong>Try it:</strong> provide <code>user</code> in <code>App.vibe</code> under <code>USER</code>, so <code>Avatar.vibe</code> shows the name. Type in the input: the avatar follows.</p>`,
    files: {
      'App.vibe': vibe(
        `import { ref } from '@usevibejs/ui';\nimport Toolbar from './Toolbar.vibe';\n\nconst user = ref({ name: 'Ada' });`,
        `<Toolbar />\n<input v-model="user.name" />`,
      ),
      'Toolbar.vibe': vibe(
        `import Avatar from './Avatar.vibe';`,
        `<header>Toolbar · <Avatar /></header>`,
      ),
      'Avatar.vibe': vibe(
        `import { inject } from '@usevibejs/ui';\nimport { USER } from './keys.ts';\n\nconst user = inject(USER);`,
        `<strong>{{ user?.name ?? 'Nobody' }}</strong>`,
      ),
      'keys.ts': `import type { InjectionKey, Ref } from '@usevibejs/ui';\n\nexport const USER: InjectionKey<Ref<{ name: string }>> = Symbol('user');\n`,
    },
    solution: {
      'App.vibe': vibe(
        `import { provide, ref } from '@usevibejs/ui';\nimport { USER } from './keys.ts';\nimport Toolbar from './Toolbar.vibe';\n\nconst user = ref({ name: 'Ada' });\nprovide(USER, user);`,
        `<Toolbar />\n<input v-model="user.name" />`,
      ),
      'Toolbar.vibe': vibe(
        `import Avatar from './Avatar.vibe';`,
        `<header>Toolbar · <Avatar /></header>`,
      ),
      'Avatar.vibe': vibe(
        `import { inject } from '@usevibejs/ui';\nimport { USER } from './keys.ts';\n\nconst user = inject(USER);`,
        `<strong>{{ user?.name ?? 'Nobody' }}</strong>`,
      ),
      'keys.ts': `import type { InjectionKey, Ref } from '@usevibejs/ui';\n\nexport const USER: InjectionKey<Ref<{ name: string }>> = Symbol('user');\n`,
    },
  },
  {
    slug: 'routing',
    title: 'Routing',
    body: `<p>The router maps paths to page components. <code>RouterView</code> shows the current page and <code>RouterLink</code> navigates without a reload. A <code>:id</code> in a path becomes <code>route.params.id</code>.</p>
<p><strong>Try it:</strong> add a link to user 2 in <code>App.vibe</code>, then open it and go back home.</p>`,
    files: {
      'main.ts': ROUTER_MAIN,
      'App.vibe': vibe(
        `import { RouterLink, RouterView } from '@usevibejs/ui/router';`,
        `<nav>\n  <RouterLink to="/">Home</RouterLink> ·\n  <RouterLink to="/users/1">User 1</RouterLink>\n</nav>\n<RouterView />`,
      ),
      'HomePage.vibe': vibe(``, `<h1>Home</h1>`),
      'UserPage.vibe': vibe(
        `import { useRoute } from '@usevibejs/ui/router';\n\nconst route = useRoute();`,
        `<h1>User {{ route.params.id }}</h1>`,
      ),
    },
    solution: {
      'main.ts': ROUTER_MAIN,
      'App.vibe': vibe(
        `import { RouterLink, RouterView } from '@usevibejs/ui/router';`,
        `<nav>\n  <RouterLink to="/">Home</RouterLink> ·\n  <RouterLink to="/users/1">User 1</RouterLink> ·\n  <RouterLink to="/users/2">User 2</RouterLink>\n</nav>\n<RouterView />`,
      ),
      'HomePage.vibe': vibe(``, `<h1>Home</h1>`),
      'UserPage.vibe': vibe(
        `import { useRoute } from '@usevibejs/ui/router';\n\nconst route = useRoute();`,
        `<h1>User {{ route.params.id }}</h1>`,
      ),
    },
  },
];

/** The order of the lessons, and the chapter each one belongs to. */
const ORDER: [chapter: string, slugs: string[]][] = [
  ['Basics', ['components', 'reactivity', 'computed', 'lists', 'forms']],
  ['Components', ['props', 'events', 'slots', 'v-model', 'styles']],
  ['Effects', ['watchers', 'lifecycle', 'provide-inject']],
  ['App', ['global-styles', 'routing']],
  ['Data', ['loading-data', 'contracts']],
];
const ALL = [...BASICS_AND_COMPONENTS, ...MORE, ...APP_MORE];

export const STEPS: (Step & { chapter: string })[] = ORDER.flatMap(([chapter, slugs]) =>
  slugs.map((slug) => ({ ...ALL.find((step) => step.slug === slug)!, chapter })),
);
