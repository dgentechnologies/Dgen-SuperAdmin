import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function AccessSettingsPage() {
  return (
    <DashboardPlaceholderPage
      title="Access Settings"
      description="Placeholder configuration page for doors, schedules, escalation rules, and control policies."
      stats={[
        { value: '03', label: 'Controlled doors' },
        { value: '02', label: 'Alert policies' },
        { value: '01', label: 'Remote action rule' },
        { value: '--', label: 'Device health' }
      ]}
      columns={['Setting', 'Value', 'Scope', 'Action']}
      rows={[
        ['Office start time', '08:00', 'Global', 'Edit'],
        ['Security alert threshold', '3 denials', 'Global', 'Adjust'],
        ['Visitor override', 'Disabled', 'Reception', 'Enable']
      ]}
    />
  );
}