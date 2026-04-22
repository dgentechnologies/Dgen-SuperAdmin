'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell, DashboardTable } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'assigned' | 'rejected';

interface WebsitePost {
  id: string;
}

interface Employee {
  id: string;
  status?: 'active' | 'banned';
}

interface ExpenseSummary {
  total: number;
  count: number;
}

interface Application {
  id: string;
  status?: ApplicationStatus;
  createdAt?: string;
}

interface ModuleHealth {
  website: 'ok' | 'error';
  access: 'ok' | 'error';
  books: 'ok' | 'error';
}

function failedResult<T>(): ApiResult<T> {
  return { success: false };
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<WebsitePost[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [health, setHealth] = useState<ModuleHealth>({ website: 'ok', access: 'ok', books: 'ok' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const [postsRes, employeesRes, summaryRes, applicationsRes] = await Promise.all([
        fetch('/api/website/posts', { cache: 'no-store' }),
        fetch('/api/access/employees', { cache: 'no-store' }),
        fetch('/api/books/expenses/summary', { cache: 'no-store' }),
        fetch('/api/website/applications', { cache: 'no-store' })
      ]);

      const nextHealth: ModuleHealth = {
        website: postsRes.ok && applicationsRes.ok ? 'ok' : 'error',
        access: employeesRes.ok ? 'ok' : 'error',
        books: summaryRes.ok ? 'ok' : 'error'
      };

      const [postsBody, employeesBody, summaryBody, applicationsBody] = await Promise.all([
        postsRes.ok ? (postsRes.json() as Promise<ApiResult<WebsitePost[]>>) : Promise.resolve(failedResult<WebsitePost[]>()),
        employeesRes.ok ? (employeesRes.json() as Promise<ApiResult<Employee[]>>) : Promise.resolve(failedResult<Employee[]>()),
        summaryRes.ok ? (summaryRes.json() as Promise<ApiResult<ExpenseSummary>>) : Promise.resolve(failedResult<ExpenseSummary>()),
        applicationsRes.ok
          ? (applicationsRes.json() as Promise<ApiResult<Application[]>>)
          : Promise.resolve(failedResult<Application[]>())
      ]);

      if (!cancelled) {
        setHealth(nextHealth);
        setPosts(postsBody.success && postsBody.data ? postsBody.data : []);
        setEmployees(employeesBody.success && employeesBody.data ? employeesBody.data : []);
        setSummary(summaryBody.success && summaryBody.data ? summaryBody.data : null);
        setApplications(applicationsBody.success && applicationsBody.data ? applicationsBody.data : []);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeEmployees = useMemo(
    () => employees.filter((item) => (item.status ?? 'active') === 'active').length,
    [employees]
  );

  const pendingApplications = useMemo(
    () => applications.filter((item) => (item.status ?? 'pending') === 'pending').length,
    [applications]
  );

  const recentActivityRows = useMemo(() => {
    return applications.slice(0, 6).map((item) => [
      item.id,
      item.status ?? 'pending',
      item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Unknown'
    ]);
  }, [applications]);

  return (
    <DashboardShell
      title="DGEN SuperAdmin Dashboard"
      description="Unified monitoring for website operations, access control, and books with live Firestore-backed metrics."
      badges={{ '/dashboard/website/applications': pendingApplications }}
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Website</span>
          <strong>{loading ? '...' : posts.length.toLocaleString('en-IN')}</strong>
          <small>Total posts</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Access</span>
          <strong>{loading ? '...' : activeEmployees.toLocaleString('en-IN')}</strong>
          <small>Active employees</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Books</span>
          <strong>{loading ? '...' : `Rs ${Math.round(summary?.total ?? 0).toLocaleString('en-IN')}`}</strong>
          <small>Current tracked spend</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Applications</span>
          <strong>{loading ? '...' : pendingApplications.toLocaleString('en-IN')}</strong>
          <small>Pending reviews</small>
        </article>
      </section>

      <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
        <article className="status-card">
          <span className="eyebrow">System Health</span>
          <strong>Module status</strong>
          <div className="stack" style={{ marginTop: '0.8rem' }}>
            <div className={`status-pill ${health.website === 'ok' ? 'status-ok' : 'status-error'}`}>
              Website: {health.website === 'ok' ? 'Operational' : 'Error'}
            </div>
            <div className={`status-pill ${health.access === 'ok' ? 'status-ok' : 'status-error'}`}>
              Access: {health.access === 'ok' ? 'Operational' : 'Error'}
            </div>
            <div className={`status-pill ${health.books === 'ok' ? 'status-ok' : 'status-error'}`}>
              Books: {health.books === 'ok' ? 'Operational' : 'Error'}
            </div>
          </div>
        </article>

        <article className="panel accent">
          <span className="eyebrow">Quick Actions</span>
          <h2 style={{ marginTop: '0.55rem' }}>Operational shortcuts</h2>
          <p style={{ marginTop: '0.6rem' }}>
            Use the left navigation to review applications, ban or unban employees, monitor access logs,
            and inspect books spend with synced backend data.
          </p>
          <div className="filter-chip-row" style={{ marginTop: '0.85rem' }}>
            <span className="filter-chip active">Live APIs</span>
            <span className="filter-chip">Auth protected</span>
            <span className="filter-chip">Premium dark UI</span>
          </div>
        </article>
      </section>

      <DashboardTable
        title="Recent application activity"
        columns={['Application ID', 'Status', 'Created']}
        rows={recentActivityRows.length ? recentActivityRows : [['No applications', '-', '-']]}
      />
    </DashboardShell>
  );
}
