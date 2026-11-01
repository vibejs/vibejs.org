// Usage: node libs/deploy.ts [id...]
// Builds each library's docs site and deploys it as its own Worker with static assets, on the
// MonsterOrigin account, on its vibejs.org subdomain; <id>.monsterorigin.workers.dev stays on as a
// fallback. No ids: every library.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { ACCOUNT_ID, SITES } from './sites.ts';

const ids = process.argv.slice(2);
const unknown = ids.filter((id) => !SITES.some((site) => site.id === id));
if (unknown.length) {
  console.error(`Unknown: ${unknown.join(', ')}. Known: ${SITES.map((s) => s.id).join(', ')}`);
  process.exit(2);
}
const libs = new URL('.', import.meta.url).pathname;

for (const site of SITES.filter((s) => ids.length === 0 || ids.includes(s.id))) {
  const run = (cmd: string, args: string[], env = {}) =>
    execFileSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  run('pnpm', ['exec', 'vite', 'build', libs], { LIB: site.id });
  // Unknown paths serve index.html, so the router handles /v0/... on a fresh load.
  const config = `${libs}dist/${site.id}.wrangler.json`;
  writeFileSync(
    config,
    JSON.stringify({
      name: site.id,
      account_id: ACCOUNT_ID,
      compatibility_date: '2026-10-01',
      workers_dev: true,
      preview_urls: false,
      // Deploy creates the DNS record and the certificate on the vibejs.org zone.
      routes: [{ pattern: site.domain, custom_domain: true }],
      assets: { directory: `./${site.id}`, not_found_handling: 'single-page-application' },
    }),
  );
  run('npx', ['wrangler', 'deploy', '--config', config]);
}
