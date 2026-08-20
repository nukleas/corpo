import type { Meta, StoryObj } from '@storybook/react';
import { LicenseDetail } from './LicenseDetail';
import { Button } from './Button';
import { LICENSES } from './LicenseCatalog.fixtures';

const meta = {
  title: 'Operations/LicenseDetail',
  component: LicenseDetail,
  tags: ['autodocs'],
} satisfies Meta<typeof LicenseDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: LICENSES[0],
    style: { maxWidth: 320 },
    actions: (
      <>
        <Button variant="primary" size="sm">Assign seat</Button>
        <Button size="sm">View usage</Button>
      </>
    ),
  },
};

export const Empty: Story = {
  args: { item: null, style: { maxWidth: 320 } },
};
