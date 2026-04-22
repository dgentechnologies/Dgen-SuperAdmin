import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function AccessEmployeesPage() {
  return (
    <DashboardPlaceholderPage
      title="Employees"
      description="Placeholder employee directory with status, RFID details, and control actions."
      stats={[
        { value: '52', label: 'Active employees' },
        { value: '04', label: 'Banned cards' },
        { value: '06', label: 'Pending onboarding' },
        { value: '--', label: 'Realtime sync' }
      ]}
      columns={['Name', 'Employee ID', 'Status', 'Action']}
      rows={[
        ['Aman Verma', 'DGEN-001', 'Active', 'Inspect'],
        ['Sara Iqbal', 'DGEN-014', 'Active', 'Ban'],
        ['Joel Mathew', 'DGEN-029', 'Banned', 'Unban']
      ]}
    />
  );
}