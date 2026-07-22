import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/** Resolve corpo package root from workspace, node_modules, or monorepo sibling. */
function resolveCorpoRoot() {
  const candidates = [
    resolve(root, 'node_modules/corpo'),
    resolve(root, '../corpo'),
    resolve(root, '../../node_modules/corpo'),
  ];
  for (const dir of candidates) {
    if (existsSync(resolve(dir, 'package.json'))) {
      try {
        const pkg = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'));
        if (pkg.name === 'corpo') return dir;
      } catch {
        /* continue */
      }
    }
  }
  throw new Error(
    'Could not find corpo package. From monorepo root run: pnpm install && pnpm build:css',
  );
}

const corpoRoot = resolveCorpoRoot();
const cssSrc = resolve(corpoRoot, 'dist/corpo.css');
const cssDest = resolve(root, 'dist/styles.css');

if (!existsSync(cssSrc)) {
  console.error(
    `Missing ${cssSrc}. Build corpo first:\n  pnpm --filter corpo build`,
  );
  process.exit(1);
}

mkdirSync(resolve(root, 'dist'), { recursive: true });
copyFileSync(cssSrc, cssDest);
console.log(`✓ copied corpo.css → dist/styles.css`);
