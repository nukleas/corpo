import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TreeView, type TreeItem } from './TreeView';

const org: TreeItem[] = [
  {
    id: 'acme',
    label: 'Acme Holdings',
    children: [
      {
        id: 'finance',
        label: 'Finance',
        children: [
          { id: 'ap', label: 'Accounts payable' },
          { id: 'payroll', label: 'Payroll' },
          { id: 'treasury', label: 'Treasury operations' },
        ],
      },
      {
        id: 'people',
        label: 'People and culture',
        children: [
          { id: 'recruiting', label: 'Recruiting' },
          { id: 'benefits', label: 'Benefits administration' },
        ],
      },
      {
        id: 'legal',
        label: 'Legal',
        children: [{ id: 'contracts', label: 'Contracts' }],
      },
    ],
  },
];

const expanded = ['acme', 'finance', 'people'];

const meta: Meta<typeof TreeView> = {
  title: 'Display/TreeView',
  component: TreeView,
  tags: ['autodocs'],
  args: {
    style: { maxWidth: 360 },
    items: org,
    expandedIds: expanded,
    selectedId: 'ap',
  },
};
export default meta;

type Story = StoryObj<typeof TreeView>;

export const Default: Story = {};

export const Interactive: Story = {
  render: function InteractiveTreeView() {
    const [expandedIds, setExpandedIds] = useState<string[]>(expanded);
    const [selectedId, setSelectedId] = useState('ap');
    return (
      <TreeView
        style={{ maxWidth: 360 }}
        aria-label="Organization"
        items={org}
        expandedIds={expandedIds}
        onExpandedChange={setExpandedIds}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />
    );
  },
};
