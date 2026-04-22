import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function WebsiteCareersPage() {
  return (
    <DashboardPlaceholderPage
      title="Careers"
      description="Placeholder openings, application funnels, and role publishing controls."
      stats={[
        { value: '05', label: 'Open roles' },
        { value: '02', label: 'Paused roles' },
        { value: '27', label: 'Applicants in review' },
        { value: '--', label: 'ATS sync' }
      ]}
      columns={['Role', 'Department', 'Status', 'Action']}
      rows={[
        ['Frontend Engineer', 'Engineering', 'Open', 'Review'],
        ['Ops Analyst', 'Operations', 'Open', 'Edit'],
        ['Finance Associate', 'Books', 'Paused', 'Resume']
      ]}
    />
  );
}