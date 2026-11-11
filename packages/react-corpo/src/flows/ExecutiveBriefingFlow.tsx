import { useState } from 'react';
import { FlowShell } from './FlowShell';
import { CardGrid } from '../components/CardGrid';
import { Stat } from '../components/Stat';
import { Alert } from '../components/Alert';
import { Accordion } from '../components/Accordion';
import { Section } from '../components/Section';

const DIRECTIVES = [
  {
    id: 'directive-12',
    title: 'Directive 12 — Growing together',
    content:
      'Regional acquisition of three competitor logistics networks is on track for Q3 close. Onboarding plans for our new colleagues are pending Compliance sign-off.',
  },
  {
    id: 'directive-9',
    title: 'Directive 9 — Workforce optimization',
    content:
      "Automation in Sublevels 2–4 has freed up capacity equal to 18% of headcount. We're framing this as an exciting growth opportunity for affected team members, who'll hear more next cycle.",
  },
  {
    id: 'directive-4',
    title: 'Directive 4 — Compliance, lovingly handled',
    content:
      'External auditor findings from the prior cycle have been remediated. Two data-retention exceptions remain open pending legal review — nothing to worry about.',
  },
];

export function ExecutiveBriefingFlow() {
  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <FlowShell
      title="Quarterly wins briefing"
      subtitle="A celebration of everything we accomplished together this quarter, prepared with care for the Executive Board."
    >
      {!alertDismissed && (
        <Alert tone="warning" title="Just between us" onDismiss={() => setAlertDismissed(true)}>
          This briefing includes a few figures we're keeping in the Halcyon family for now. Sharing it outside the
          Executive Board would technically violate your employment agreement — but we know you've got this.
        </Alert>
      )}

      <CardGrid columns={3}>
        <Stat label="Quarterly revenue" value="$482M" delta="+6.1%" deltaTone="up" />
        <Stat label="Compliance score" value="97.4" delta="+0.8" deltaTone="up" />
        <Stat label="Personnel retention" value="91%" delta="-2.3%" deltaTone="down" />
      </CardGrid>

      <Section title="Active directives">
        <Accordion items={DIRECTIVES} defaultOpen={['directive-12']} />
      </Section>
    </FlowShell>
  );
}
