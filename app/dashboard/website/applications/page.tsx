import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function WebsiteApplicationsPage() {
  return (
    <DashboardPlaceholderPage
      title="Applications"
      description="Placeholder application review queue for internships and other website-submitted forms."
      stats={[
        { value: '11', label: 'Pending review' },
        { value: '07', label: 'Under review' },
        { value: '03', label: 'Assigned' },
        { value: '--', label: 'Email automation' }
      ]}
      columns={['Candidate', 'Role', 'Status', 'Action']}
      rows={[
        ['Riya Kapoor', 'Design Intern', 'Pending', 'Assign'],
        ['Kabir Shah', 'Frontend Intern', 'Under Review', 'Open'],
        ['Mira Thomas', 'Ops Intern', 'Assigned', 'Notify']
      ]}
    />
  );
}