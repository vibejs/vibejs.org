# vibejs.org

The website and documentation of [vibe.js](https://github.com/vibejs/vibejs), built with vibe.js itself: `.vibe` components, the vibe.js router and a static build.

vibe.js: npm scope `@usevibejs`, CLI `vibejs` (never `vibe`). Not monday.com Vibe (`@vibe/*`), not the `@vibe.js/*` packages (a different project), not the npm packages `vibejs` or `vibe.js`.

## Layout

| Path            | What it holds                                                                                |
| --------------- | -------------------------------------------------------------------------------------------- |
| `ui/src/`       | The site: the home page, the docs reader and their components.                               |
| `content/`      | The docs pages as Markdown, with `pages.json` (titles and the sidebar). Served under `/v0/`. |
| `build/`        | Build-time tooling: the Markdown renderer and the `.vibe` grammars of the VS Code extension. |
| `scripts/`      | `sync-docs.ts`, which regenerates `content/` from a `vibejs/vibejs` checkout.                |
| `ui/public/v0/` | `llms.txt` and `llms-full.txt`.                                                              |

Docs pages are rendered and highlighted at build time, and each page is its own chunk. Error codes keep the URLs that released packages print: `https://vibejs.org/v0/errors/VIBE####`.

## Commands

| Command                            | What it does                                                   |
| ---------------------------------- | -------------------------------------------------------------- |
| `pnpm dev`                         | Serves the site with hot reload.                               |
| `pnpm check`                       | Type-checks (templates included), lints, format-checks, tests. |
| `pnpm build`                       | Builds the static site into `ui/dist`.                         |
| `pnpm preview`                     | Serves the built site.                                         |
| `pnpm sync-docs <vibejs checkout>` | Regenerates `content/` and `llms*.txt` from a built checkout.  |

Requires Node.js `^24.15.0 || >=26` and pnpm.

## Deploying

The build is a static single-page app in `ui/dist`. Unknown paths must serve `index.html`, so a fresh load of `/v0/...` reaches the router.

- **Cloudflare Workers:** `pnpm build`, then `wrangler deploy` with `wrangler.jsonc`.
- **Cloudflare Pages:** build command `pnpm build`, output directory `ui/dist`.

## License

MIT
