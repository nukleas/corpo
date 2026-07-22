import type { Preview } from '@storybook/react';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    backgrounds: {
      default: 'page',
      values: [
        { name: 'page', value: '#f6f8fa' },
        { name: 'panel', value: '#ffffff' },
        { name: 'dark', value: '#0e1218' },
      ],
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'corpo accent theme',
      defaultValue: 'teal',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'teal', title: 'Teal (default)' },
          { value: 'amber', title: 'Amber' },
          { value: 'green', title: 'Green' },
          { value: 'red', title: 'Red' },
          { value: 'steel', title: 'Steel' },
        ],
        dynamicTitle: true,
      },
    },
    dark: {
      description: 'corpo-dark heritage scope',
      defaultValue: false,
      toolbar: {
        title: 'Dark scope',
        icon: 'circlehollow',
        items: [
          { value: false, title: 'Light' },
          { value: true, title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || 'teal';
      const dark = context.globals.dark === true || context.globals.dark === 'true';
      return (
        // @ts-expect-error decorator returns JSX; Storybook runtime handles this
        <div
          className={`theme-${theme}${dark ? ' corpo-dark' : ''}`}
          style={{
            fontFamily: 'var(--corpo-font-sans)',
            color: 'var(--corpo-text)',
            background: 'var(--corpo-bg)',
            padding: 24,
            minWidth: 280,
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
