import { eslintCompatPlugin } from '@oxlint/plugins';

import { noCardAroundTableRule } from './rules/no-card-around-table.ts';
import { noCardListRule } from './rules/no-card-list.ts';
import { noNestedCardRule } from './rules/no-nested-card.ts';
import { onePrimaryActionRule } from './rules/one-primary-action.ts';

/** Oxlint rules for the statically checkable composition rules in BUILDING.md. */
const corpoPlugin = eslintCompatPlugin({
  meta: { name: 'corpo' },
  rules: {
    'no-card-around-table': noCardAroundTableRule,
    'no-card-list': noCardListRule,
    'no-nested-card': noNestedCardRule,
    'one-primary-action': onePrimaryActionRule,
  },
});

export default corpoPlugin;
