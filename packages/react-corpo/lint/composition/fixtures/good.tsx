// Patterns the composition rules must accept. The test requires zero diagnostics in this file.
import { ActionBar, Button, Card, CardGrid, DataTable, Modal, Section, Stat } from '@nukleas/react-corpo';

import { Card as LocalCard } from './Card';

const invoices = [{ id: 'INV-1', total: 120 }];
const plans = ['Standard', 'Enterprise'];

export function TableInSection() {
  return (
    <Section title="Invoices">
      <DataTable compact columns={[]} rows={invoices} />
    </Section>
  );
}

export function CardWithMoreThanATable() {
  return (
    <Card title="Aging">
      <p>Overdue balances by customer.</p>
      <DataTable columns={[]} rows={[]} />
    </Card>
  );
}

export function SiblingCards() {
  return (
    <CardGrid columns={2}>
      <Card title="Receivables">Open invoices</Card>
      <Card title="Payables">Bills due</Card>
    </CardGrid>
  );
}

export function DashboardStats() {
  return (
    <CardGrid>
      {invoices.map((invoice) => (
        <Stat key={invoice.id} label={invoice.id} value={invoice.total} />
      ))}
    </CardGrid>
  );
}

export function NotCorpo() {
  // `./Card` here is not corpo's components/Card, so nothing below is a corpo card.
  return (
    <LocalCard>
      <LocalCard />
      {plans.map((plan) => (
        <LocalCard key={plan} />
      ))}
    </LocalCard>
  );
}

export function OnePrimaryPerScope({ dirty }: { dirty: boolean }) {
  return (
    <div>
      <ActionBar
        actions={[
          { id: 'post', label: 'Post', variant: 'primary' },
          { id: 'approve', label: 'Approve', variant: 'primary' },
        ]}
      />
      <Button variant="primary">Save</Button>
      <Button>Cancel</Button>
      {dirty ? <Button variant="primary">Save draft</Button> : <Button variant="primary">Submit</Button>}
      <Modal open title="Void invoice" onClose={() => undefined} footer={<Button variant="primary">Void</Button>} />
    </div>
  );
}
