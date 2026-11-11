import { posix } from 'node:path';

import type { ESTree } from '@oxlint/plugins';

/** The corpo components the composition rules reason about. */
export type CorpoComponent =
  'AlertDialog' | 'Button' | 'Card' | 'CardGrid' | 'DataTable' | 'Modal' | 'Sheet' | 'SplitButton' | 'Table';

const COMPONENTS: ReadonlyArray<CorpoComponent> = [
  'AlertDialog',
  'Button',
  'Card',
  'CardGrid',
  'DataTable',
  'Modal',
  'Sheet',
  'SplitButton',
  'Table',
];

const PACKAGE = '@nukleas/react-corpo';

function asCorpoComponent(name: string): CorpoComponent | null {
  return COMPONENTS.find((component) => component === name) ?? null;
}

/**
 * Whether an import source points at corpo: the published package, or a relative path that
 * resolves to `components/<Name>` (how this repo's own stories and examples import).
 */
function isCorpoSource(source: string, imported: CorpoComponent, filename: string): boolean {
  if (source === PACKAGE) return true;
  if (!source.startsWith('.')) return false;
  const from = posix.dirname(filename.replaceAll('\\', '/'));
  return posix.join(from, source).endsWith(`/components/${imported}`);
}

/** Local JSX names bound to corpo components in one file, honoring `import { Card as Panel }`. */
export function corpoImports(program: ESTree.Program, filename: string): Map<string, CorpoComponent> {
  const bindings = new Map<string, CorpoComponent>();
  for (const statement of program.body) {
    if (statement.type !== 'ImportDeclaration' || statement.importKind === 'type') continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type !== 'ImportSpecifier' || specifier.importKind === 'type') continue;
      const imported = asCorpoComponent(
        specifier.imported.type === 'Literal' ? specifier.imported.value : specifier.imported.name,
      );
      if (imported !== null && isCorpoSource(statement.source.value, imported, filename)) {
        bindings.set(specifier.local.name, imported);
      }
    }
  }
  return bindings;
}

/** The corpo component an element renders, or null for DOM tags, member names and other components. */
export function componentOf(bindings: Map<string, CorpoComponent>, node: ESTree.Node): CorpoComponent | null {
  if (node.type !== 'JSXElement') return null;
  const name = node.openingElement.name;
  return name.type === 'JSXIdentifier' ? (bindings.get(name.name) ?? null) : null;
}

/** Strips parentheses around an expression (oxlint keeps them as nodes). */
export function unwrap(node: ESTree.Expression): ESTree.Expression {
  return node.type === 'ParenthesizedExpression' ? unwrap(node.expression) : node;
}
