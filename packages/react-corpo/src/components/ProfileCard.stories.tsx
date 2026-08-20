import type { Meta, StoryObj } from '@storybook/react';
import { ProfileCard } from './ProfileCard';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { StatusPill } from './StatusPill';

const meta = {
  title: 'Operations/ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const CAPACITY = [
  { label: 'Utilization', value: 70 },
  { label: 'On-call load', value: 25, tone: 'success' as const },
];

const profileChildren = (
  <>
    <ProfileCard.Portrait>
      <Avatar size="lg" initials="AS" status="online" />
      <StatusPill tone="ok">Available</StatusPill>
    </ProfileCard.Portrait>
    <ProfileCard.Identity name="Ana Sørensen" role="Staff engineer" team="Payments platform" />
    <ProfileCard.Capacity rows={CAPACITY} />
    <ProfileCard.Skills>
      <Chip>Kotlin</Chip>
      <Chip>Postgres</Chip>
      <Chip>Payments</Chip>
      <Chip>Incident response</Chip>
    </ProfileCard.Skills>
    <ProfileCard.Bio>
      Leads the invoice pipeline rebuild. Previously scaled the ledger service through two
      provider migrations; mentors two engineers on the team.
    </ProfileCard.Bio>
  </>
);

export const Default: Story = {
  args: { style: { maxWidth: 440 }, children: profileChildren },
};

export const Compact: Story = {
  args: { compact: true, style: { maxWidth: 360 }, children: profileChildren },
};

/** Three-column layout — capacity sits beside the identity. Collapses below 768px. */
export const Wide: Story = {
  args: { wide: true, style: { maxWidth: 680 }, children: profileChildren },
};
