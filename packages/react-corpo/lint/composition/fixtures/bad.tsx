// Each `expect corpo/<rule>` marker names a diagnostic the test requires on the following line.
import { Button, Card as Panel, CardGrid, DataTable, Modal, SplitButton, Table } from '@nukleas/react-corpo';

import { Card } from '../../../src/components/Card';

const invoices = [{ id: 'INV-1', total: 120 }];

export function NestedCard() {
  return (
    <Card title="Customer">
      {/* expect corpo/no-nested-card */}
      <Card title="Address">400 Harbor Rd</Card>
    </Card>
  );
}

export function NestedThroughProp() {
  return (
    <Panel
      title="Customer"
      // expect corpo/no-nested-card
      footer={<Panel title="Notes">None</Panel>}
    >
      Body
    </Panel>
  );
}

export function CardAroundTable() {
  return (
    <>
      {/* expect corpo/no-card-around-table */}
      <Card title="Invoices">
        {/* a comment is not content */}
        <Table columns={[]} rows={[]} />
      </Card>
      {/* expect corpo/no-card-around-table */}
      <Card>
        <DataTable columns={[]} rows={[]} />
      </Card>
    </>
  );
}

export function CardList() {
  return (
    <CardGrid>
      {invoices.map((invoice) => (
        // expect corpo/no-card-list
        <Card key={invoice.id} title={invoice.id}>
          {invoice.total}
        </Card>
      ))}
      {invoices.map((invoice) => {
        if (invoice.total === 0) return null;
        // expect corpo/no-card-list
        return <Card key={invoice.id} title={invoice.id} />;
      })}
      {invoices.map(function row(invoice) {
        // expect corpo/no-card-list
        return <Card key={invoice.id} title={invoice.id} />;
      })}
    </CardGrid>
  );
}

export function TwoPrimaries() {
  return (
    <div>
      <Button variant="primary">Save</Button>
      {/* expect corpo/one-primary-action */}
      <SplitButton variant="primary" items={[]}>
        Post
      </SplitButton>
      {/* expect corpo/one-primary-action */}
      <Button variant={'primary'}>Approve</Button>
    </div>
  );
}

export function PrimaryInDialog() {
  return (
    <Modal open title="Void invoice" onClose={() => undefined}>
      <Button variant="primary">Void invoice</Button>
      {/* expect corpo/one-primary-action */}
      <Button variant="primary">Void and email</Button>
    </Modal>
  );
}
