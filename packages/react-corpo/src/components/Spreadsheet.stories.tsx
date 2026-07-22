import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spreadsheet } from './Spreadsheet';

const meta: Meta<typeof Spreadsheet> = {
  title: 'Display/Spreadsheet',
  component: Spreadsheet,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Spreadsheet>;

export const Default: Story = {
  render: () => {
    const [rows, setRows] = useState([
      ['Q1', '12,400', '9,100'],
      ['Q2', '13,750', '9,800'],
      ['Q3', '14,200', '10,300'],
    ]);
    return (
      <Spreadsheet
        rows={rows}
        columnLabels={['Quarter', 'Revenue', 'Cost']}
        onCellChange={(r, c, v) => setRows((prev) => prev.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)))}
      />
    );
  },
};
