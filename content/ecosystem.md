# Ecosystem

Each package does one job. An install command appears only when that package's README already shows one.

## Core

These packages are published from [vibejs](https://github.com/vibejs/vibejs).

### [@usevibejs/ui](https://github.com/vibejs/vibejs/tree/HEAD/packages/ui)

The vibe.js UI runtime: fine-grained reactivity, components, the router and test utilities ([UI docs](https://vibejs.org/v0/ui/)).

```sh
npm install @usevibejs/ui
```

### [@usevibejs/compiler](https://github.com/vibejs/vibejs/tree/HEAD/packages/compiler)

The compiler and Vite plugin that turn vibe.js `.vibe` single-file components into fine-grained DOM code ([docs](https://vibejs.org/v0/)).

```sh
npm install -D @usevibejs/compiler
```

### [@usevibejs/server](https://github.com/vibejs/vibejs/tree/HEAD/packages/server)

The vibe.js server: modules, dependency injection, guards, interceptors and a fetch-based HTTP pipeline ([server docs](https://vibejs.org/v0/server/)).

```sh
npm install @usevibejs/server
```

### [@usevibejs/contract](https://github.com/vibejs/vibejs/tree/HEAD/packages/contract)

Typed contracts shared by a vibe.js server and its UI client, validated with Standard Schema ([contracts](https://vibejs.org/v0/server/contracts)).

```sh
npm install @usevibejs/contract
```

### [@usevibejs/cli](https://github.com/vibejs/vibejs/tree/HEAD/packages/cli)

The `vibejs` command line: dev server, build, checks, generators, JSON output and an MCP server for coding agents ([CLI reference](https://vibejs.org/v0/cli/)).

```sh
npm install -D @usevibejs/cli
```

### [create-vibejs](https://github.com/vibejs/vibejs/tree/HEAD/packages/create-vibejs)

Creates a full-stack vibe.js app: the UI in `ui/`, the server in `server/` and the contracts they share in `contracts/`, with an `AGENTS.md` for coding agents ([getting started](https://vibejs.org/v0/guides/getting-started)).

```sh
npm create vibejs@latest my-app
pnpm create vibejs my-app
yarn create vibejs my-app
bun create vibejs my-app
```

## Packages

### [@usevibejs/auth](https://github.com/vibejs/vibeauth)

`@usevibejs/auth` connects Better Auth to vibe.js Fetch middleware, fine-grained reactivity, dependency injection, router guards and typed business APIs ([docs](https://auth.vibejs.org)).

```sh
pnpm add @usevibejs/auth better-auth
```

### [@usevibejs/form](https://github.com/vibejs/vibeform)

VibeForm connects TanStack Form Core 1.33 to the fine-grained reactivity of vibe.js ([docs](https://form.vibejs.org)).

```sh
pnpm add @usevibejs/form @usevibejs/ui
```

### [@usevibejs/query](https://github.com/vibejs/vibequery)

VibeQuery is a data-fetching and async state library for vibe.js, powered by TanStack Query ([docs](https://query.vibejs.org)).

```sh
pnpm add @usevibejs/query
```

### [@usevibejs/table](https://github.com/vibejs/vibetable)

`@usevibejs/table` is a native, fine-grained vibe.js adapter for TanStack Table Core v9 ([docs](https://table.vibejs.org)).

```sh
pnpm add @usevibejs/table @usevibejs/ui
pnpm add -D @usevibejs/compiler @usevibejs/language-tools vite
```

### [@usevibejs/virtual](https://github.com/vibejs/vibevirtual)

Native, headless virtualization for vibe.js, powered by TanStack Virtual Core 3.19.8.

```sh
pnpm add @usevibejs/virtual @usevibejs/ui
```

### [@usevibejs/motion](https://github.com/vibejs/vibemotion)

Animations, springs, gestures, scroll, layout and presence for vibe.js, powered by Motion.

```sh
pnpm add @usevibejs/motion @usevibejs/ui
```

### [@usevibejs/dnd](https://github.com/vibejs/vibednd)

A headless, native vibe.js integration for modern dnd-kit DOM.

```sh
pnpm add @usevibejs/dnd @usevibejs/ui
```

### [@usevibejs/i18n](https://github.com/vibejs/vibei18n)

ICU-powered internationalization for vibe.js: app-scoped reactive locales, typed keys, generated ICU parameter schemas, atomic lazy loading, native Intl formatting, direction, routing, persistence, and catalog tooling ([docs](https://i18n.vibejs.org)).

```sh
pnpm add @usevibejs/i18n @usevibejs/ui
```

### [@usevibejs/socket](https://github.com/vibejs/vibesocket)

Typed WebSockets, authorized rooms, bounded reconnecting clients and Fetch-compatible SSE for vibe.js ([docs](https://socket.vibejs.org)).

```sh
pnpm add @usevibejs/socket @usevibejs/ui valibot
```

### [@usevibejs/use](https://github.com/vibejs/vibeuse)

`@usevibejs/use` provides 42 native, typed composables for vibe.js: local reactivity, browser APIs, storage, elements, sensors and scheduling.

```sh
pnpm add @usevibejs/use @usevibejs/ui@^0.1.0
```

### [vibecn](https://github.com/vibejs/vibecn)

Accessible, beautifully designed components for vibe.js, adapted from shadcn/ui, copied into the app as `.vibe` source rather than imported from `node_modules` ([docs](https://vibecn.dev)).

```sh
pnpm dlx @usevibejs/vibecn@latest init
```

## Coming

Coming in this program. Nothing in this section is published, and none of it has an install command.

### @usevibejs/flags (coming)

Feature flags from the [todo-flags](https://github.com/vibejs/vibejs/tree/HEAD/examples/todo-flags) example, off by default, with no network.

### @usevibejs/db (coming)

A Drizzle server module that migrates when the app starts and closes its pool on shutdown, tested with PGlite.

### @usevibejs/mail (coming)

Sends mail through a console driver or Resend, with a template written as a plain function.

### @usevibejs/storage (coming)

File storage on local disk or S3-compatible storage, including signed reads, built on the file body below.

### @usevibejs/jobs (coming)

A queue and a worker with a one-time key and retries, in memory or in SQL when the database package is present.

### @usevibejs/shield (coming)

A sliding-window rate limit and security headers, independent of auth.

### @usevibejs/billing (coming)

Stripe Checkout sessions and webhooks whose signatures are checked.

### create-vibejs --preset saas (coming)

The scaffolder has no saas preset yet; the path will be `pnpm create vibejs my-app --preset saas`, scaffolding a contract, Drizzle, an auth guard, query, a form, the vibecn pieces button, field, card, login-form and data-table, and one resource of projects inside an organization, with static serving on, and only after the packages it uses are published ([getting started](https://vibejs.org/v0/guides/getting-started) is the preset that exists today).

### Static serving (coming)

The [server](https://vibejs.org/v0/server/) does not serve the built UI itself yet; a static root with an SPA fallback will answer GET requests outside `/api` with the file, or with `index.html` when the file is missing, on the same fetch handler Node and a worker share.

### files() body (coming)

[Contract](https://vibejs.org/v0/server/contracts) bodies are JSON today; a `files()` body will accept `FormData` with size and type limits for the handler to read.

### useHead and SSR (coming)

`useHead` is not in the [UI](https://vibejs.org/v0/ui/) yet: it will record title, meta and link tags in the browser, `useTitle` and `useFavicon` stay in `@usevibejs/use`, and rendering the tree to a string and hydrating it come later.
