import { defineRule, type ESTree } from '@oxlint/plugins';

import { componentOf, corpoImports, type CorpoComponent } from '../shared/corpo-components.ts';

/** BUILDING.md "Never" 2: a card inside a card is a frame inside a frame. */
export const noNestedCardRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow a corpo Card rendered anywhere inside another Card.',
    },
    messages: {
      nestedCard:
        'Remove the inner `Card`. A card inside a card is a frame inside a frame; separate parts with `Section` instead.',
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
        for (let ancestor: ESTree.Node | null = node.parent; ancestor !== null; ancestor = ancestor.parent) {
          if (componentOf(bindings, ancestor) === 'Card') {
            context.report({ node: node.openingElement, messageId: 'nestedCard' });
            return;
          }
        }
      },
    };
  },
});
