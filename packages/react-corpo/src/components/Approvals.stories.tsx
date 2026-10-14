import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Approvals, type Approver } from './Approvals';
import { Stepper } from './Stepper';

const APPROVERS: Approver[] = [
  {
    id: 'mgr',
    name: 'Maria Anders',
    role: 'Department manager',
    decision: 'approved',
    decidedAt: 'Oct 6, 9:14 AM',
    comment: 'Needed for the Q4 warehouse refit.',
  },
  { id: 'fin', name: 'Ana Sørensen', role: 'Finance', decision: 'pending' },
  { id: 'cfo', name: 'Brian Okafor', role: 'CFO — over $25,000', decision: 'pending' },
];

const meta: Meta<typeof Approvals> = {
  title: 'Display/Approvals',
  component: Approvals,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Approvals>;

function Requisition() {
  const [approvers, setApprovers] = useState(APPROVERS);
  const stage = approvers.some((a) => a.decision === 'rejected')
    ? 1
    : approvers.every((a) => a.decision === 'approved')
      ? 3
      : 1;
  return (
    <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Stepper items={[{ label: 'Draft' }, { label: 'Approval' }, { label: 'Ordered' }]} current={stage} />
      <Approvals
        approvers={approvers}
        actorId="fin"
        onDecide={(decision, comment) =>
          setApprovers(
            approvers.map((a) =>
              a.id === 'fin' ? { ...a, decision, comment: comment || undefined, decidedAt: 'Just now' } : a,
            ),
          )
        }
      />
    </div>
  );
}

/**
 * A purchase requisition's sign-off: each approver's decision in order, a Stepper for the document's
 * lifecycle, and Approve / Reject for the signed-in approver (Ana, Finance). Rejecting needs a comment.
 */
export const Default: Story = {
  render: () => <Requisition />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 of 3 approved')).toBeInTheDocument();
    const reject = canvas.getByRole('button', { name: 'Reject' });
    await expect(reject).toBeDisabled();

    await userEvent.type(canvas.getByRole('textbox', { name: 'Comment' }), 'Within budget.');
    await expect(reject).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));
    await expect(canvas.getByText('2 of 3 approved')).toBeInTheDocument();
    await expect(canvas.getByText('Within budget.')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Approve' })).toBeNull();
  },
};

/** A rejection shows its reason; nobody else can act. */
export const Rejected: Story = {
  args: {
    approvers: [
      APPROVERS[0],
      {
        ...APPROVERS[1],
        decision: 'rejected',
        decidedAt: 'Oct 6, 11:40 AM',
        comment: 'Over the Q4 capex limit — resubmit in January.',
      },
      APPROVERS[2],
    ],
  },
};
