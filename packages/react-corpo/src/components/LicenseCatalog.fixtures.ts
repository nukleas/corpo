import type { LicenseItem } from './LicenseCatalog';

/** Shared demo catalog for the assignment-panel stories. */
export const LICENSES: LicenseItem[] = [
  {
    id: 'datadog',
    name: 'Datadog',
    tier: 'enterprise',
    category: 'Observability · Annual contract',
    seats: 12,
    details: [
      { label: 'Cost per seat', value: '$28/mo' },
      { label: 'Renewal', value: 'Mar 1, 2027' },
      { label: 'Seats in use', value: '9 of 12' },
    ],
    desc: 'Metrics, traces, and log management for the platform group. Includes on-call paging integration.',
  },
  {
    id: 'figma',
    name: 'Figma',
    tier: 'professional',
    category: 'Design · Monthly',
    seats: 4,
    details: [
      { label: 'Cost per seat', value: '$12/mo' },
      { label: 'Renewal', value: 'Monthly' },
      { label: 'Seats in use', value: '4 of 4' },
    ],
    desc: 'Product design and prototyping. All seats are currently in use — raise a request to add more.',
  },
  {
    id: 'linear',
    name: 'Linear',
    tier: 'standard',
    category: 'Tracking · Annual contract',
    seats: 30,
    details: [
      { label: 'Cost per seat', value: '$7/mo' },
      { label: 'Renewal', value: 'Oct 12, 2026' },
      { label: 'Seats in use', value: '22 of 30' },
    ],
    desc: 'Issue tracking and cycle planning for all product teams.',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    tier: 'free',
    category: 'Editor',
    details: [{ label: 'Cost per seat', value: 'Free' }],
    desc: 'Default editor. No allocation needed; listed for completeness.',
  },
  {
    id: 'gh-copilot',
    name: 'GitHub Copilot',
    tier: 'standard',
    category: 'Developer tools · Monthly',
    seats: 20,
    details: [
      { label: 'Cost per seat', value: '$15/mo' },
      { label: 'Renewal', value: 'Monthly' },
      { label: 'Seats in use', value: '14 of 20' },
    ],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    tier: 'professional',
    category: 'Error monitoring · Annual contract',
    seats: 15,
    details: [
      { label: 'Cost per seat', value: '$9/mo' },
      { label: 'Renewal', value: 'Jun 3, 2027' },
      { label: 'Seats in use', value: '11 of 15' },
    ],
  },
];
