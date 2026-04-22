import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function BooksReportsPage() {
  return (
    <DashboardPlaceholderPage
      title="Reports"
      description="Placeholder reporting area for trends, exports, and finance summaries."
      stats={[
        { value: '04', label: 'Report templates' },
        { value: '01', label: 'Quarter in focus' },
        { value: '12', label: 'Audit views' },
        { value: '--', label: 'PDF export' }
      ]}
      columns={['Report', 'Range', 'Status', 'Action']}
      rows={[
        ['Monthly spend', 'Apr 2026', 'Ready', 'Download'],
        ['Department summary', 'Q2 2026', 'Draft', 'Preview'],
        ['Audit trail', 'FY 2025-26', 'Queued', 'Generate']
      ]}
    />
  );
}