import type { Meta, StoryObj } from '@storybook/react';
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
