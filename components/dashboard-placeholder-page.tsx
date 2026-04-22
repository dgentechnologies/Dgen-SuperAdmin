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
      <section className="dashboard-grid">
        <article className="panel">
          <h2>{title} Overview</h2>
          <p>Everything on this screen is placeholder-only and ready for data binding later.</p>
        </article>
        <article className="panel accent">
          <h2>Next Integration Step</h2>
          <p>Connect this route to the matching API endpoint when the backend side is ready to be wired.</p>
        </article>
      </section>
      <DashboardTable title={title} columns={columns} rows={rows} />
    </DashboardShell>
  );
}