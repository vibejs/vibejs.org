declare module 'virtual:site' {
  export const site: { id: string; name: string; pkg: string; tagline: string; github: string };
  export const pages: { path: string; title: string; description?: string }[];
  export const sidebar: { text: string; items: { text: string; link: string }[] }[];
  export const loaders: Record<
    string,
    () => Promise<{ default: import('../../ui/src/docs.ts').DocModule }>
  >;
}
