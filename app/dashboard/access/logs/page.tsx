import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function AccessLogsPage() {
  return (
    <DashboardPlaceholderPage
      title="Access Logs"
      description="Placeholder event stream for grant, deny, and remote unlock actions."
      stats={[
        { value: '125', label: 'Granted today' },
        { value: '08', label: 'Denied today' },
        { value: '02', label: 'Remote unlocks' },
        { value: '--', label: 'CSV export' }
      ]}
      columns={['Employee', 'Action', 'Time', 'Action']}
      rows={[
        ['Aman Verma', 'Granted', '09:05', 'View'],
        ['Sara Iqbal', 'Denied', '09:31', 'Audit'],
        ['Admin Panel', 'Remote Unlock', '10:12', 'Inspect']
      ]}
    />
  );
}