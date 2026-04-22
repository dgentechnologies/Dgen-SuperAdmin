import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function WebsiteMessagesPage() {
  return (
    <DashboardPlaceholderPage
      title="Website Messages"
      description="Placeholder inbox for contact form submissions, lead triage, and message review."
      stats={[
        { value: '09', label: 'Unread items' },
        { value: '14', label: 'Assigned follow-ups' },
        { value: '03', label: 'Escalated leads' },
        { value: '--', label: 'CRM sync' }
      ]}
      columns={['Sender', 'Topic', 'Priority', 'Action']}
      rows={[
        ['Aarav Mehta', 'Demo request', 'High', 'Reply'],
        ['Neha Singh', 'Support question', 'Medium', 'Assign'],
        ['Global Ops Team', 'Partnership intro', 'Low', 'Archive']
      ]}
    />
  );
}