import { defineRule, type ESTree } from '@oxlint/plugins';

import { componentOf, corpoImports, type CorpoComponent } from '../shared/corpo-components.ts';

const DIALOGS: ReadonlyArray<CorpoComponent> = ['AlertDialog', 'Modal', 'Sheet'];

/** A literal `variant="primary"` (or `variant={'primary'}`); computed variants are not counted. */
function hasPrimaryVariant(node: ESTree.JSXOpeningElement): boolean {
  return node.attributes.some((attribute) => {
    if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') return false;
    if (attribute.name.name !== 'variant' || attribute.value === null) return false;
    const value = attribute.value.type === 'JSXExpressionContainer' ? attribute.value.expression : attribute.value;
    return value.type === 'Literal' && value.value === 'primary';
  });
}

function isFunction(node: ESTree.Node): boolean {
  return (
    node.type === 'ArrowFunctionExpression' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression'
  );
}

/**
 * Where a primary button counts: the nearest enclosing corpo dialog or function. A conditional
 * branch (`a ? <x/> : <y/>`, `a && <x/>`) is its own scope, so mutually exclusive buttons are
 * never counted together.
 */
function scopeOf(bindings: Map<string, CorpoComponent>, node: ESTree.JSXElement): ESTree.Node {
  let child: ESTree.Node = node;
  let parent: ESTree.Node | null = node.parent;
  while (parent !== null) {
    const component = componentOf(bindings, parent);
    if (isFunction(parent) || (component !== null && DIALOGS.includes(component))) return parent;
    if (parent.type === 'ConditionalExpression' && child !== parent.test) return child;
    if (parent.type === 'LogicalExpression' && child === parent.right) return child;
    child = parent;
    parent = parent.parent;
  }
  return child;
}

/** BUILDING.md "Never" 8: one primary action per page or dialog. */
export const onePrimaryActionRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow more than one `variant="primary"` Button or SplitButton per component or dialog.',
    },
    messages: {
      extraPrimary:
        'Keep one primary action here. Make this `variant="default"`, or move it into an `ActionBar` or `SplitButton` menu.',
    },
  },
  createOnce(context) {
    let bindings = new Map<string, CorpoComponent>();
    let primaries = new Map<ESTree.Node, ESTree.JSXOpeningElement[]>();
    return {
      Program(program) {
        bindings = corpoImports(program, context.filename);
        primaries = new Map();
      },
      JSXElement(node) {
        const component = componentOf(bindings, node);
        if (component !== 'Button' && component !== 'SplitButton') return;
        if (!hasPrimaryVariant(node.openingElement)) return;
        const scope = scopeOf(bindings, node);
        primaries.set(scope, [...(primaries.get(scope) ?? []), node.openingElement]);
      },
      'Program:exit'() {
        for (const buttons of primaries.values()) {
          for (const extra of buttons.slice(1)) context.report({ node: extra, messageId: 'extraPrimary' });
        }
      },
    };
  },
});
