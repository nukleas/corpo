import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';

// Every story is a test: it must render without errors, its play function
// (if any) must pass, and the rendered page must have no WCAG 2.1 A/AA
// violations. Axe scans the whole body so portaled overlays (Modal, Sheet,
// Toast) are covered too.
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (storyContext.parameters?.a11y?.disable) return;
    await configureAxe(page, { rules: storyContext.parameters?.a11y?.config?.rules });
    await checkA11y(page, 'body', {
      verbose: false,
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        ...storyContext.parameters?.a11y?.options,
      },
    });
  },
};

export default config;
