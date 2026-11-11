// Runs oxlint with the composition plugin over fixtures/ and checks the diagnostics against the
// `expect corpo/<rule>` markers in bad.tsx (each names a diagnostic on the following line).
// good.tsx must produce none.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures');

/** oxlint exits non-zero when it reports errors; the JSON on stdout is what matters. */
function lint() {
  const args = ['-c', join(fixtures, 'oxlintrc.fixtures.json'), '--format', 'json', fixtures];
  try {
    return execFileSync('oxlint', args, { encoding: 'utf8' });
  } catch (error) {
    if (error.stdout) return error.stdout;
    throw error;
  }
}

const actual = JSON.parse(lint())
  .diagnostics.map((d) => `${relative(fixtures, d.filename)}:${d.labels[0].span.line} ${d.code}`)
  .sort();

const expected = readFileSync(join(fixtures, 'bad.tsx'), 'utf8')
  .split('\n')
  .flatMap((line, index) => {
    const marker = line.match(/expect corpo\/([a-z-]+)/);
    return marker ? [`bad.tsx:${index + 2} corpo(${marker[1]})`] : [];
  })
  .sort();

const missing = expected.filter((entry) => !actual.includes(entry));
const unexpected = actual.filter((entry) => !expected.includes(entry));

if (missing.length > 0 || unexpected.length > 0) {
  for (const entry of missing) console.error(`missing:    ${entry}`);
  for (const entry of unexpected) console.error(`unexpected: ${entry}`);
  process.exit(1);
}
console.log(`composition lint: ${expected.length} expected diagnostics, none unexpected`);
