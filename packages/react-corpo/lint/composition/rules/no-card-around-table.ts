import { defineRule, type ESTree } from '@oxlint/plugins';

import { componentOf, corpoImports, type CorpoComponent } from '../shared/corpo-components.ts';

/** Children that render something: drops whitespace-only text and `{/* comments *\/}`. */
function meaningfulChildren(node: ESTree.JSXElement): ESTree.JSXChild[] {
  return node.children.filter((child) => {
    if (child.type === 'JSXText') return child.value.trim() !== '';
    if (child.type === 'JSXExpressionContainer') return child.expression.type !== 'JSXEmptyExpression';
    return true;
  });
}

/** BUILDING.md "Never" 2: a table has its own frame. */
export const noCardAroundTableRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow a corpo Card whose only child is a Table or DataTable.',
    },
    messages: {
      cardAroundTable:
        'Remove the `Card` around this table. A table has its own frame; use `Section` for a heading and actions.',
    },
  },
  createOnce(context) {
    let bindings = new Map<string, CorpoComponent>();
    return {
      Program(program) {
        bindings = corpoImports(program, context.filename);
      },
      JSXElement(node) {
        if (componentOf(bindings, node) !== 'Card') return;
        const children = meaningfulChildren(node);
        if (children.length !== 1) return;
        const only = componentOf(bindings, children[0]);
        if (only === 'Table' || only === 'DataTable') {
          context.report({ node: node.openingElement, messageId: 'cardAroundTable' });
        }
      },
    };
  },
});
