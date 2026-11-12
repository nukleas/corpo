// Writes dist/llms.txt: an index for coding agents, generated from the public barrel and each
// component's JSDoc, so it can't drift from the code. BUILDING.md carries the composition rules.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const barrel = readFileSync(resolve(root, 'src/index.ts'), 'utf8');
const modules = [...barrel.matchAll(/export \* from '\.\/components\/(\w+)'/g)].map((m) => m[1]);

/** First sentence of the JSDoc directly above `export function|const <name>` (or the module's main export). */
function summary(name) {
  const source = readFileSync(resolve(root, `src/components/${name}.tsx`), 'utf8');
  const at = source.search(new RegExp(`export (function|const) ${name}\\b`));
  const before = source.slice(0, at < 0 ? source.search(/export (function|const) /) : at);
  const close = before.lastIndexOf('*/');
  if (close < 0 || before.slice(close + 2).trim() !== '') return '';
  const text = before
    .slice(before.lastIndexOf('/**', close) + 3, close)
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim())
    .filter((line) => line && !line.startsWith('@'))
    .join(' ')
    .replace(/\{@link (\w+)\}/g, '$1');
  const sentence = text.match(/^(.+?[.:])(\s|$)/);
  return (sentence ? sentence[1] : text).replace(/^Corpo /, '').replace(/[.:]$/, '');
}

const lines = [
  `# ${pkg.name}`,
  '',
  `> ${pkg.description}`,
  '',
  'Read BUILDING.md (in this package) before composing a screen: dense is fine, decoration is not.',
  'Every component renders corpo CSS classes; import `@nukleas/react-corpo/styles.css` once.',
  '',
  '## Components',
  '',
  ...modules.map((name) => {
    const text = summary(name);
    return text ? `- ${name}: ${text}` : `- ${name}`;
  }),
  '',
];

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/llms.txt'), lines.join('\n'));
console.log(`✓ wrote dist/llms.txt (${modules.length} modules)`);
