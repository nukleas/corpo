// Design-system contract check — the AGENTS.md hard rules, made mechanical.
//
// 1. Every `cp-*` class emitted by React, the JS engines, or the demo pages
//    exists as a selector in corpo CSS. Template-literal classes
//    (`cp-badge--${color}`) are checked as prefixes; a bare block name counts
//    when CSS styles its elements or modifiers (`cp-trial` → `cp-trial__title`);
//    a class the same file queries (`querySelector('.cp-x')`) is a JS hook.
//    A line containing `contract-ignore` is skipped — use it for `cp-` ids.
// 2. Every `var(--corpo-*)` reference resolves to a token (semantic or theme)
//    or a custom property declared in corpo CSS.
// 3. Every export of the thin `corpo/react` wrappers is also exported by
//    react-corpo — a component never lives half-migrated in one package.
// 4. Every react-corpo component module is rendered by at least one story.
//
// Run: pnpm check:contract

import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { semanticTokens } from '../packages/corpo/src/tokens/semantic.js';
import { amberTheme } from '../packages/corpo/src/tokens/themes/amber.js';
import { darkTheme } from '../packages/corpo/src/tokens/themes/dark.js';
import { greenTheme } from '../packages/corpo/src/tokens/themes/green.js';
import { redTheme } from '../packages/corpo/src/tokens/themes/red.js';
import { steelTheme } from '../packages/corpo/src/tokens/themes/steel.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CORPO = join(ROOT, 'packages/corpo');
const REACT = join(ROOT, 'packages/react-corpo');

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

function walk(dir: string, match: (file: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((d) => d.isFile() && match(join(d.parentPath, d.name)))
    .map((d) => join(d.parentPath, d.name));
}

const rel = (file: string) => relative(ROOT, file);
const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;

// ---------------------------------------------------------------- CSS inventory

const cssFiles = walk(join(CORPO, 'src/css'), (f) => f.endsWith('.css'));
const cssClasses = new Set<string>();
const cssDeclaredProps = new Set<string>();
for (const file of cssFiles) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\.(cp-[a-z0-9_-]+)/g)) cssClasses.add(m[1]);
  for (const m of text.matchAll(/(--corpo-[a-z0-9-]+)\s*:/g)) cssDeclaredProps.add(m[1]);
}

const tokenProps = new Set(
  [semanticTokens, amberTheme, darkTheme, greenTheme, redTheme, steelTheme].flatMap((t) =>
    Object.keys(t).map((k) => `--corpo-${k}`),
  ),
);

// ---------------------------------------------------------------- 1. classes

const emitters = [
  ...walk(join(REACT, 'src'), (f) => f.endsWith('.tsx') || f.endsWith('.ts')),
  ...walk(join(CORPO, 'src/react'), (f) => f.endsWith('.tsx') || f.endsWith('.ts')),
  ...walk(join(CORPO, 'src/js'), (f) => f.endsWith('.js')),
  ...walk(join(CORPO, 'test'), (f) => f.endsWith('.html')),
  ...walk(join(CORPO, 'examples'), (f) => f.endsWith('.html')),
];

const isBlockRoot = (name: string) =>
  [...cssClasses].some((c) => c.startsWith(`${name}__`) || c.startsWith(`${name}--`));

for (const file of emitters) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  // A class name, optionally followed by `${` — then it is a template prefix.
  // `cp-chart-*` in prose is a wildcard, not a class.
  for (const m of text.matchAll(/(?<![\w-])(cp-[a-z0-9_-]*[a-z0-9_-])(\$\{|\*)?/g)) {
    if (m[2] === '*') continue;
    const line = lineOf(text, m.index);
    if (lines[line - 1].includes('contract-ignore')) continue;
    const name = m[1];
    const isPrefix = m[2] !== undefined;
    const ok = isPrefix
      ? [...cssClasses].some((c) => c.startsWith(name))
      : cssClasses.has(name) || isBlockRoot(name) || text.includes(`'.${name}'`);
    if (!ok) {
      fail(`${rel(file)}:${line}  class ${isPrefix ? `prefix "${name}…"` : `"${name}"`} has no selector in corpo CSS`);
    }
  }
}

// ---------------------------------------------------------------- 2. tokens

const tokenUsers = [...cssFiles, ...emitters];
for (const file of tokenUsers) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/var\(\s*(--corpo-[a-z0-9-]+)/g)) {
    if (!tokenProps.has(m[1]) && !cssDeclaredProps.has(m[1])) {
      fail(`${rel(file)}:${lineOf(text, m.index)}  "${m[1]}" is not a corpo token or a declared custom property`);
    }
  }
}

// ---------------------------------------------------------------- 3. export parity

function exportsOf(entry: string): Set<string> {
  const program = ts.createProgram([entry], {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const symbol = source && checker.getSymbolAtLocation(source);
  if (!symbol) throw new Error(`cannot resolve module ${entry}`);
  return new Set(checker.getExportsOfModule(symbol).map((sym) => sym.getName()));
}

const thinExports = exportsOf(join(CORPO, 'src/react/index.ts'));
const fullExports = exportsOf(join(REACT, 'src/index.ts'));
for (const name of thinExports) {
  if (!fullExports.has(name)) fail(`corpo/react exports "${name}" but react-corpo does not`);
}

// ---------------------------------------------------------------- 4. stories

const componentDir = join(REACT, 'src/components');
const storyText = walk(join(REACT, 'src'), (f) => f.endsWith('.stories.tsx'))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
for (const file of walk(componentDir, (f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))) {
  const mod = basename(file, '.tsx');
  if (!new RegExp(`from '(\\./|\\.\\./components/)${mod}'`).test(storyText)) {
    fail(`${rel(file)}  is not imported by any story`);
  }
}

// ---------------------------------------------------------------- report

if (failures.length) {
  console.error(`Contract check failed — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `Contract check passed — ${emitters.length} files, ${cssClasses.size} CSS classes, ${tokenProps.size} tokens, ${thinExports.size} corpo/react exports.`,
);
