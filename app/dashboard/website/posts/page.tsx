import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function WebsitePostsPage() {
  return (
    <DashboardPlaceholderPage
      title="Website Posts"
      description="Placeholder list, filters, and publishing actions for the content team."
      stats={[
        { value: '18', label: 'Draft posts' },
        { value: '42', label: 'Published posts' },
        { value: '06', label: 'Scheduled updates' },
        { value: '--', label: 'Live analytics' }
      ]}
      columns={['Title', 'Status', 'Author', 'Action']}
      rows={[
        ['Placeholder launch article', 'Draft', 'Admin', 'Edit'],
        ['Placeholder product note', 'Published', 'Marketing', 'View'],
        ['Placeholder case study', 'Scheduled', 'Editor', 'Publish']
      ]}
    />
  );
}