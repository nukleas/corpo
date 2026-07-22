import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from './Combobox';

const options = [
  { value: 'acme', label: 'Acme Ltd' },
  { value: 'northwind', label: 'Northwind Traders' },
  { value: 'globex', label: 'Globex Corporation' },
  { value: 'initech', label: 'Initech' },
];

const meta: Meta<typeof Combobox> = {
  title: 'Forms/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { options },
};
export default meta;

type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <div style={{ width: 240 }}>
        <Combobox {...args} value={value} onChange={setValue} placeholder="Select a client…" />
      </div>
    );
  },
};
