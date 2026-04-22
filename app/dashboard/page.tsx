import { DashboardShell, DashboardTable, StatsStrip } from '@/components/site-shell';

const stats = [
  { value: '12', label: 'Website placeholder widgets' },
  { value: '08', label: 'Access placeholder actions' },
  { value: '15', label: 'Books placeholder entries' },
  { value: '24/7', label: 'Interface availability' }
];

const overviewRows = [
  ['Website', 'Posts, messages, careers, applications', 'Placeholder'],
  ['Access', 'Employees, logs, settings', 'Placeholder'],
  ['Books', 'Expenses, reports', 'Placeholder']
];

export default function DashboardPage() {
  return (
    <DashboardShell
      title="DGEN SuperAdmin Dashboard"
      description="Every dashboard option is now routed and viewable with placeholder content. No backend calls are required for navigation."
    >
      <StatsStrip stats={stats} />
      <section className="dashboard-grid">
        <article className="panel">
          <h2>Operations Snapshot</h2>
          <p>Use this card area for summary widgets, charts, and quick actions once real APIs are connected.</p>
        </article>
        <article className="panel accent">
          <h2>Placeholder Activity Feed</h2>
          <p>Recent posts, access events, finance approvals, and notifications can be rendered here later.</p>
        </article>
      </section>
      <DashboardTable
        title="Available Modules"
        columns={['Module', 'Sections', 'Status']}
        rows={overviewRows}
      />
    </DashboardShell>
  );
}
