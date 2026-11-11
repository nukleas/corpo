import { defineRule, type ESTree } from '@oxlint/plugins';

import { componentOf, corpoImports, unwrap, type CorpoComponent } from '../shared/corpo-components.ts';

/** `return` arguments of one function body, not descending into nested functions. */
function returnedExpressions(statements: Array<ESTree.Directive | ESTree.Statement>): ESTree.Expression[] {
  const found: ESTree.Expression[] = [];
  for (const statement of statements) {
    if (statement.type === 'ReturnStatement' && statement.argument !== null) found.push(statement.argument);
    if (statement.type === 'BlockStatement') found.push(...returnedExpressions(statement.body));
    if (statement.type === 'IfStatement') {
      found.push(...returnedExpressions([statement.consequent]));
      if (statement.alternate !== null) found.push(...returnedExpressions([statement.alternate]));
    }
  }
  return found;
}

/** What a `.map` callback hands back: an arrow's expression body, or its `return` arguments. */
function callbackResults(callback: ESTree.Argument): ESTree.Expression[] {
  if (callback.type === 'ArrowFunctionExpression') {
    return callback.body.type === 'BlockStatement' ? returnedExpressions(callback.body.body) : [callback.body];
  }
  if (callback.type === 'FunctionExpression' && callback.body !== null) {
    return returnedExpressions(callback.body.body);
  }
  return [];
}

function isMapCall(node: ESTree.CallExpression): boolean {
  const callee = node.callee;
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'map'
  );
}

/** BUILDING.md "Never" 1: records with the same fields are a table, not a grid of cards. */
export const noCardListRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow rendering a list of records as corpo Cards produced by `.map()`.',
    },
    messages: {
      cardList:
        'Render this list as a `DataTable compact`, not one `Card` per record. Lists of records are a compact DataTable; cards hide the columns people compare.',
    },
  },
  createOnce(context) {
    let bindings = new Map<string, CorpoComponent>();
    return {
      Program(program) {
        bindings = corpoImports(program, context.filename);
      },
      CallExpression(node) {
        if (!isMapCall(node) || node.arguments.length === 0) return;
        for (const result of callbackResults(node.arguments[0])) {
          const root = unwrap(result);
          if (root.type === 'JSXElement' && componentOf(bindings, root) === 'Card') {
            context.report({ node: root.openingElement, messageId: 'cardList' });
          }
        }
      },
    };
  },
});
