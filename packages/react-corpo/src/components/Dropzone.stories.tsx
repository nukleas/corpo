import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dropzone, type DropzoneFile } from './Dropzone';

const demoFiles: DropzoneFile[] = [
  { id: 'w9', name: 'acme-w9-2026.pdf', size: 245_760 },
  { id: 'payroll', name: 'q3-payroll-export.xlsx', size: 2_516_582, status: 'uploading', progress: 62 },
  { id: 'vendor', name: 'vendor-statement.csv', size: 15_518_106, status: 'error', error: 'File exceeds 10 MB' },
];

const meta: Meta<typeof Dropzone> = {
  title: 'Forms/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  args: {
    style: { maxWidth: 440 },
    hint: 'PDF, XLSX, or CSV · 10 MB max',
    accept: '.pdf,.xlsx,.csv',
    files: [],
    onRemove: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof Dropzone>;

export const Default: Story = {};

export const WithFiles: Story = {
  args: { files: demoFiles },
};

export const Disabled: Story = {
  args: { files: demoFiles, disabled: true },
};

export const Interactive: Story = {
  render: function InteractiveDropzone() {
    const [files, setFiles] = useState<DropzoneFile[]>(demoFiles);
    return (
      <Dropzone
        style={{ maxWidth: 440 }}
        hint="PDF, XLSX, or CSV · 10 MB max"
        accept=".pdf,.xlsx,.csv"
        files={files}
        onFiles={(incoming) => {
          setFiles((prev) => [
            ...prev,
            ...incoming.map((file) => ({
              id: `${file.name}-${file.lastModified}-${file.size}`,
              name: file.name,
              size: file.size,
            })),
          ]);
        }}
        onRemove={(id) => setFiles((prev) => prev.filter((file) => file.id !== id))}
      />
    );
  },
};
