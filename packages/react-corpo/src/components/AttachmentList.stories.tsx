import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { AttachmentList, type Attachment } from './AttachmentList';

const FILES: Attachment[] = [
  {
    id: 'a1',
    name: 'PO-88231 signed.pdf',
    size: 248_312,
    href: '#po-88231.pdf',
    uploadedBy: 'Maria Anders',
    uploadedAt: 'Oct 5',
  },
  {
    id: 'a2',
    name: 'Dock layout.png',
    size: 1_835_008,
    href: '#dock.png',
    uploadedBy: 'Ana Sørensen',
    uploadedAt: 'Oct 6',
  },
  { id: 'a3', name: 'Freight quote.xlsx', size: 18_944, uploadedBy: 'Ana Sørensen', uploadedAt: 'Oct 6' },
];

const meta: Meta<typeof AttachmentList> = {
  title: 'Display/AttachmentList',
  component: AttachmentList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof AttachmentList>;

/** Files on a record: type, a download link, size and who added it, with attach and remove. */
export const Default: Story = {
  render: () => {
    const [files, setFiles] = useState(FILES);
    return (
      <div style={{ maxWidth: 360 }}>
        <AttachmentList
          attachments={files}
          onRemove={(id) => setFiles(files.filter((f) => f.id !== id))}
          onAdd={(picked) =>
            setFiles([
              ...files,
              ...picked.map((f, i) => ({
                id: `n${files.length + i}`,
                name: f.name,
                size: f.size,
                uploadedBy: 'Ana Sørensen',
                uploadedAt: 'Just now',
              })),
            ])
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'PO-88231 signed.pdf' })).toHaveAttribute(
      'download',
      'PO-88231 signed.pdf',
    );
    await expect(canvas.getByText('1.8 MB · Ana Sørensen · Oct 6')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove Dock layout.png' }));
    await expect(canvas.queryByText('Dock layout.png')).toBeNull();

    const picker = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error('file input missing');
    await userEvent.upload(picker, new File(['x'.repeat(2048)], 'Delivery note.pdf', { type: 'application/pdf' }));
    await expect(canvas.getByText('Delivery note.pdf')).toBeInTheDocument();
    await expect(canvas.getByText('2.0 KB · Ana Sørensen · Just now')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <AttachmentList attachments={[]} onAdd={() => {}} />
    </div>
  ),
};
