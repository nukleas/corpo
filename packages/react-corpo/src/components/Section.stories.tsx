import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';
import { Button } from './Button';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  args: {
    title: 'Billing',
    description: 'Where invoices for this account are sent.',
    actions: <Button size="sm">Edit billing</Button>,
    children: <p>Invoices go to billing@acme.com on the first business day of each month.</p>,
  },
};
export default meta;

type Story = StoryObj<typeof Section>;

export const Default: Story = {};

/** Sections stack with even spacing; nested sections step their heading level down. */
export const Stacked: Story = {
  render: () => (
    <>
      <Section title="Account" description="Company details on file.">
        <Section title="Primary contact" level={3}>
          <p>Maria Anders, maria@northwind.example</p>
        </Section>
        <Section title="Tax" level={3}>
          <p>Exempt — certificate on file through Dec 2027.</p>
        </Section>
      </Section>
      <Section title="Security" actions={<Button size="sm">Review sessions</Button>}>
        <p>Two-factor authentication is required for all members.</p>
      </Section>
    </>
  ),
};
