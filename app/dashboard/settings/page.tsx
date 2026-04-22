import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function DashboardSettingsPage() {
  return (
    <DashboardPlaceholderPage
      title="Dashboard Settings"
      description="Placeholder admin preferences page for branding, notifications, and user roles."
      stats={[
        { value: '03', label: 'Admin seats' },
        { value: '02', label: 'Notification channels' },
        { value: '01', label: 'Brand profile' },
        { value: '--', label: 'Permission sync' }
      ]}
      columns={['Preference', 'Value', 'Scope', 'Action']}
      rows={[
        ['Theme', 'Default DGEN', 'Workspace', 'Edit'],
        ['Email alerts', 'Enabled', 'Admins', 'Change'],
        ['Session policy', 'Placeholder', 'Security', 'Review']
      ]}
    />
  );
}