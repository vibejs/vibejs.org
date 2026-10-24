// A minimal POSIX `path` for the tutorial's in-browser compiler: postcss emits the source map that
// the compiler's compileStyle reads only when `path` is available. File names here are flat
// (`App.vibe`), so these few functions are all it needs.
export const sep = '/';
const parts = (p) => p.split('/').filter((part) => part && part !== '.');
export function isAbsolute(p) {
  return p.startsWith('/');
}
export function normalize(p) {
  const out = [];
  for (const part of parts(p)) {
    if (part === '..') out.pop();
    else out.push(part);
  }
  return (isAbsolute(p) ? '/' : '') + out.join('/');
}
export function join(...paths) {
  return normalize(paths.join('/'));
}
export function resolve(...paths) {
  let path = '';
  for (const p of paths) path = isAbsolute(p) ? p : `${path}/${p}`;
  return normalize(isAbsolute(path) ? path : `/${path}`);
}
export function dirname(p) {
  const i = p.lastIndexOf('/');
  return i <= 0 ? (i === 0 ? '/' : '.') : p.slice(0, i);
}
export function basename(p) {
  return p.slice(p.lastIndexOf('/') + 1);
}
export function extname(p) {
  const base = basename(p);
  const i = base.lastIndexOf('.');
  return i > 0 ? base.slice(i) : '';
}
export function relative(from, to) {
  const a = parts(resolve(from));
  const b = parts(resolve(to));
  while (a.length && b.length && a[0] === b[0]) {
    a.shift();
    b.shift();
  }
  return [...a.map(() => '..'), ...b].join('/');
}
export default { sep, isAbsolute, normalize, join, resolve, dirname, basename, extname, relative };
