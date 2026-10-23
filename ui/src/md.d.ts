declare module '*.md' {
  const page: import('./docs.ts').DocModule;
  export default page;
}
