// The vibe.js libraries that get a docs site of their own, one Worker each, built from the
// library's checkout next to this one: its README.md is the docs home, docs/**/*.md the pages.

export interface SidebarConfig {
  text: string;
  /** Content paths: '' is the README, 'functions/*' every page in docs/functions. */
  items: string[];
}

export interface Site {
  /** The checkout's folder name, the Worker name and the workers.dev subdomain. */
  id: string;
  /** The custom domain the Worker serves, on the vibejs.org zone. */
  domain: string;
  name: string;
  pkg: string;
  tagline: string;
  github: string;
  sidebar: SidebarConfig[];
}

/** The MonsterOrigin Cloudflare account, which holds the vibejs.org zone. */
export const ACCOUNT_ID = 'acfa4c03475e6aa2ff83723be5b4932f';

/** Where a library's checkout lives: a sibling of this repository. */
export const checkout = (site: Site): string =>
  decodeURIComponent(new URL(`../../${site.id}/`, import.meta.url).pathname);

export const SITES: Site[] = [
  {
    id: 'vibeuse',
    domain: 'use.vibejs.org',
    name: 'VibeUse',
    pkg: '@usevibejs/use',
    tagline: 'Essential composables for vibe.js.',
    github: 'https://github.com/vibejs/vibeuse',
    sidebar: [
      {
        text: 'Getting started',
        items: [
          '',
          'getting-started/why-vibeuse',
          'getting-started/installation',
          'getting-started/quick-start',
          'getting-started/framework-compatibility',
        ],
      },
      {
        text: 'Guide',
        items: [
          'guide/reactivity',
          'guide/refs-and-getters',
          'guide/lifecycle',
          'guide/event-handling',
          'guide/browser-apis',
          'guide/storage',
          'guide/typescript',
          'guide/performance',
          'guide/troubleshooting',
        ],
      },
      { text: 'Functions', items: ['functions/*'] },
      {
        text: 'Advanced',
        items: [
          'advanced/architecture',
          'advanced/custom-composables',
          'advanced/building-reusable-utilities',
          'advanced/integrating-with-vibecn',
          'advanced/testing',
          'advanced/contribution-guide',
        ],
      },
    ],
  },
  {
    id: 'vibednd',
    domain: 'dnd.vibejs.org',
    name: 'VibeDND',
    pkg: '@usevibejs/dnd',
    tagline: 'Powerful drag and drop for vibe.js.',
    github: 'https://github.com/vibejs/vibednd',
    sidebar: [
      { text: 'Getting started', items: ['', 'getting-started', 'architecture'] },
      {
        text: 'Core',
        items: ['core/draggable', 'core/droppable', 'core/events', 'core/manager'],
      },
      { text: 'Sorting', items: ['sorting/lists', 'sorting/containers', 'sorting/controlled'] },
      {
        text: 'Interactions',
        items: [
          'interactions/sensors',
          'interactions/collision',
          'interactions/modifiers',
          'interactions/feedback',
          'interactions/scrolling',
        ],
      },
      {
        text: 'Advanced',
        items: [
          'advanced/accessibility',
          'advanced/nested',
          'advanced/virtualization',
          'advanced/performance',
          'advanced/vibecn',
          'advanced/ecosystem',
          'advanced/troubleshooting',
        ],
      },
      { text: 'Reference', items: ['reference/api', 'reference/limitations'] },
    ],
  },
  {
    id: 'vibetable',
    domain: 'table.vibejs.org',
    name: 'VibeTable',
    pkg: '@usevibejs/table',
    tagline: 'Headless tables for vibe.js, powered by TanStack Table.',
    github: 'https://github.com/vibejs/vibetable',
    sidebar: [
      { text: 'Getting started', items: ['', 'getting-started', 'reactivity'] },
      {
        text: 'Guide',
        items: ['features', 'rendering', 'integrations', 'performance', 'troubleshooting'],
      },
      { text: 'Reference', items: ['api'] },
    ],
  },
  {
    id: 'vibesocket',
    domain: 'socket.vibejs.org',
    name: 'VibeSocket',
    pkg: '@usevibejs/socket',
    tagline: 'Realtime, native to vibe.js.',
    github: 'https://github.com/vibejs/vibesocket',
    sidebar: [
      { text: 'Getting started', items: ['', 'getting-started'] },
      { text: 'Guide', items: ['client', 'server', 'delivery', 'streaming', 'ecosystem'] },
      { text: 'Production', items: ['security', 'scaling', 'operations'] },
      { text: 'Reference', items: ['reference', 'architecture'] },
    ],
  },
  {
    id: 'vibequery',
    domain: 'query.vibejs.org',
    name: 'VibeQuery',
    pkg: '@usevibejs/query',
    tagline: 'Async state and data fetching for vibe.js, powered by TanStack Query.',
    github: 'https://github.com/vibejs/vibequery',
    sidebar: [
      { text: 'Getting started', items: ['', 'concepts', 'migration'] },
      {
        text: 'Guide',
        items: [
          'queries',
          'mutations',
          'invalidation',
          'cache',
          'infinite',
          'optimistic',
          'contract',
          'typescript',
          'mistakes',
        ],
      },
      { text: 'Reference', items: ['api', 'architecture'] },
    ],
  },
  {
    id: 'vibemotion',
    domain: 'motion.vibejs.org',
    name: 'VibeMotion',
    pkg: '@usevibejs/motion',
    tagline: 'Animations, springs, gestures, scroll, layout and presence for vibe.js.',
    github: 'https://github.com/vibejs/vibemotion',
    sidebar: [
      { text: 'Getting started', items: ['', 'guide'] },
      { text: 'Reference', items: ['performance', 'decisions/0001-architecture'] },
    ],
  },
  {
    id: 'vibeauth',
    domain: 'auth.vibejs.org',
    name: 'VibeAuth',
    pkg: '@usevibejs/auth',
    tagline: 'Authentication for vibe.js, powered by Better Auth.',
    github: 'https://github.com/vibejs/vibeauth',
    sidebar: [
      {
        text: 'Getting started',
        items: ['', 'index', 'getting-started', 'configuration', 'migration'],
      },
      {
        text: 'Authentication',
        items: ['email-password', 'social', 'passkeys', 'two-factor', 'sessions', 'organizations'],
      },
      {
        text: 'Integration',
        items: ['client', 'router', 'server', 'contracts', 'authorization', 'ecosystem', 'vibecn'],
      },
      {
        text: 'Production',
        items: [
          'databases',
          'deployment',
          'cloudflare',
          'security',
          'threat-model',
          'testing',
          'troubleshooting',
        ],
      },
      { text: 'Reference', items: ['api', 'architecture', 'verification'] },
    ],
  },
  {
    id: 'vibeform',
    domain: 'form.vibejs.org',
    name: 'VibeForm',
    pkg: '@usevibejs/form',
    tagline: 'Type-safe forms for vibe.js, powered by TanStack Form.',
    github: 'https://github.com/vibejs/vibeform',
    sidebar: [
      { text: 'Getting started', items: ['', 'guide', 'migration'] },
      {
        text: 'Guide',
        items: ['validation', 'accessibility', 'integrations', 'performance', 'troubleshooting'],
      },
      { text: 'Reference', items: ['api'] },
    ],
  },
  {
    id: 'vibei18n',
    domain: 'i18n.vibejs.org',
    name: 'VibeI18n',
    pkg: '@usevibejs/i18n',
    tagline: 'ICU-powered internationalization for vibe.js.',
    github: 'https://github.com/vibejs/vibei18n',
    sidebar: [
      { text: 'Getting started', items: ['', 'getting-started'] },
      {
        text: 'Guide',
        items: [
          'core',
          'formatting',
          'type-safety',
          'advanced',
          'ecosystem',
          'tooling',
          'security-performance',
        ],
      },
      { text: 'Reference', items: ['reference'] },
    ],
  },
  {
    id: 'vibevirtual',
    domain: 'virtual.vibejs.org',
    name: 'VibeVirtual',
    pkg: '@usevibejs/virtual',
    tagline: 'Headless virtualization for vibe.js, powered by TanStack Virtual.',
    github: 'https://github.com/vibejs/vibevirtual',
    sidebar: [
      { text: 'Getting started', items: ['', 'getting-started'] },
      {
        text: 'Guide',
        items: [
          'virtualizers',
          'layouts',
          'advanced',
          'accessibility',
          'ecosystem',
          'performance',
          'troubleshooting',
        ],
      },
      { text: 'Reference', items: ['reference', 'architecture'] },
    ],
  },
];
