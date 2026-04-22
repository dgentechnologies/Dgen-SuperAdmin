import { DashboardShell, DashboardTable, StatsStrip } from '@/components/site-shell';

type DashboardPlaceholderPageProps = {
  title: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
  columns: string[];
  rows: string[][];
};

export function DashboardPlaceholderPage({
  title,
  description,
  stats,
  columns,
  rows
}: DashboardPlaceholderPageProps) {
  return (
    <DashboardShell title={title} description={description}>
      <StatsStrip stats={stats} />
      <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
        <article className="panel">
          <h2>{title} Workspace</h2>
          <p style={{ marginTop: '0.55rem' }}>
            This section is now laid out in the production shell and ready for deeper workflow logic.
            Existing metrics, layout, and navigation are already aligned with the live dashboard system.
          </p>
        </article>
        <article className="panel accent">
          <h2>Implementation Notes</h2>
          <p style={{ marginTop: '0.55rem' }}>
            Connect this module to its full query and action handlers to complete operational behavior.
            Styling, spacing, and responsive behavior are already part of the upgraded design system.
          </p>
        </article>
      </section>
      <DashboardTable title={title} columns={columns} rows={rows} />
    </DashboardShell>
  );
}