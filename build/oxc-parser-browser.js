// The browser stand-in for `oxc-parser`, aliased in ui/vite.config.ts for the tutorial's in-browser
// compiler: the WebAssembly binding with the same `parseSync` and `visitorKeys`. Raw transfer
// (shared memory) is a Node.js optimization, so it reports unsupported here.
import * as bindings from '@oxc-parser/binding-wasm32-wasip1';
import { wrap } from 'oxc-parser/src-js/wrap.js';

export { default as visitorKeys } from 'oxc-parser/src-js/generated/visit/keys.js';

export function rawTransferSupported() {
  return false;
}

export function parseSync(filename, sourceText, options) {
  return wrap(bindings.parseSync(filename, sourceText, options));
}
