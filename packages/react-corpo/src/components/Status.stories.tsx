import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { StatusDot } from './StatusDot';
import { StatusPill } from './StatusPill';
import { StatusBar } from './StatusBar';

const meta: Meta<typeof StatusPill> = {
  title: 'Display/Status',
  component: StatusPill,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof StatusPill>;

export const Dots: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <StatusDot tone="ok" />
      <StatusDot tone="warn" />
      <StatusDot tone="err" />
      <StatusDot tone="idle" />
      <StatusDot tone="info" />
    </div>
  ),
};

export const Pills: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatusPill tone="ok">Operational</StatusPill>
      <StatusPill tone="warn">Degraded</StatusPill>
      <StatusPill tone="err">Down</StatusPill>
    </div>
  ),
};

export const Bar: Story = {
  render: () => (
    <StatusBar
      items={[
        { id: 'uptime', label: 'Uptime', value: '99.98%' },
        { id: 'latency', label: 'Latency', value: '84ms' },
        { id: 'region', label: 'Region', value: 'eu-west-2' },
      ]}
    />
  ),
};

/** A long strip scrolls inside the bar. The page around it stays put. */
export const ScrollsInside: Story = {
  render: () => (
    <div data-testid="frame" style={{ width: 280 }}>
      <StatusBar
        items={[
          { id: 'uptime', label: 'Uptime', value: '99.98%' },
          { id: 'latency', label: 'Latency', value: '84ms' },
          { id: 'region', label: 'Region', value: 'eu-west-2' },
          { id: 'queue', label: 'Queue', value: '14 waiting' },
          { id: 'source', label: 'Source', value: 'Regulations.gov (EPA, OSHA, PHMSA)' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('[data-testid="frame"]');
    const bar = canvasElement.querySelector('.cp-status-bar');
    if (!(frame instanceof HTMLElement) || !(bar instanceof HTMLElement)) throw new Error('missing status bar');
    await expect(bar.scrollWidth).toBeGreaterThan(bar.clientWidth + 8);
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
  },
};
