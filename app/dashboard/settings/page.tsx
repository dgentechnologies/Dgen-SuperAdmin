'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Employee {
  id: string;
  status?: 'active' | 'banned';
}

interface Application {
  id: string;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'assigned' | 'rejected';
}

interface AuditLog {
  id: string;
  type?: string;
  adminEmail?: string;
  adminUid?: string;
  performedBy?: string;
  timestamp?: unknown;
}

function toDateTimeLabel(value: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN');
  }

  if (typeof value === 'object' && value !== null) {
    const withSeconds = value as { seconds?: number; _seconds?: number };
    const rawSeconds = withSeconds.seconds ?? withSeconds._seconds;
    if (typeof rawSeconds === 'number') {
      return new Date(rawSeconds * 1000).toLocaleString('en-IN');
    }
  }

  return '-';
}

export default function DashboardSettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [employeesRes, applicationsRes, auditsRes] = await Promise.all([
          fetch('/api/access/employees', { cache: 'no-store' }),
          fetch('/api/website/applications', { cache: 'no-store' }),
          fetch('/api/superadmin/audit-logs?limit=120', { cache: 'no-store' })
        ]);

        if (!employeesRes.ok || !applicationsRes.ok || !auditsRes.ok) {
          throw new Error('Failed to load dashboard settings data');
        }

        const [employeesBody, applicationsBody, auditsBody] = (await Promise.all([
          employeesRes.json(),
          applicationsRes.json(),
          auditsRes.json()
        ])) as [ApiResult<Employee[]>, ApiResult<Application[]>, ApiResult<AuditLog[]>];

        if (!cancelled) {
          setEmployees(employeesBody.success && employeesBody.data ? employeesBody.data : []);
          setApplications(applicationsBody.success && applicationsBody.data ? applicationsBody.data : []);
          setAuditLogs(auditsBody.success && auditsBody.data ? auditsBody.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard settings');
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const activeEmployees = employees.filter((item) => (item.status ?? 'active') === 'active').length;
    const bannedEmployees = employees.filter((item) => (item.status ?? 'active') === 'banned').length;
    const pendingApplications = applications.filter((item) => (item.status ?? 'pending') === 'pending').length;
    const loginEvents = auditLogs.filter((item) => item.type === 'login').length;

    return {
      activeEmployees,
      bannedEmployees,
      pendingApplications,
      loginEvents
    };
  }, [employees, applications, auditLogs]);

  const recentTypes = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of auditLogs) {
      const type = row.type?.trim() || 'unknown';
      map.set(type, (map.get(type) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [auditLogs]);

  return (
    <DashboardShell
      title="Dashboard Settings"
      description="Administrative governance view powered by live identity, application, and superadmin audit-log data."
      badges={{ '/dashboard/website/applications': stats.pendingApplications }}
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Active Admin Surface</span>
          <strong>{loading ? '...' : stats.activeEmployees.toLocaleString('en-IN')}</strong>
          <small>Active employee accounts in access system</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Restricted Accounts</span>
          <strong>{loading ? '...' : stats.bannedEmployees.toLocaleString('en-IN')}</strong>
          <small>Banned employee profiles</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Pending Reviews</span>
          <strong>{loading ? '...' : stats.pendingApplications.toLocaleString('en-IN')}</strong>
          <small>Applications requiring action</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Recent Logins</span>
          <strong>{loading ? '...' : stats.loginEvents.toLocaleString('en-IN')}</strong>
          <small>Login events in fetched audit window</small>
        </article>
      </section>

      {error ? <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div> : null}

      <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
        <article className="panel">
          <h2>Audit Event Distribution</h2>
          {loading ? (
            <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading audit event types...</p>
          ) : recentTypes.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '0.8rem' }}>
              <strong>No audit events found</strong>
              <p>Audit activity will appear after authenticated actions are performed.</p>
            </div>
          ) : (
            <div className="stack" style={{ marginTop: '0.8rem' }}>
              {recentTypes.map((item) => (
                <div key={item.type} className="status-pill" style={{ justifyContent: 'space-between' }}>
                  <span>{item.type}</span>
                  <span className="mono">{item.count.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel accent">
          <h2>Security Policy Snapshot</h2>
          <p style={{ marginTop: '0.6rem' }}>
            Session handling is enforced via secure HTTP-only cookies and cryptographic verification on every API route.
          </p>
          <p style={{ marginTop: '0.55rem' }}>
            All destructive operations (ban, unban, assignment, remote unlock) are written to the superadmin audit log.
          </p>
          <p className="subtle" style={{ marginTop: '0.75rem' }}>
            This page reflects live governance data, not static placeholders.
          </p>
        </article>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>Recent Audit Logs</h2>
        {loading ? (
          <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading recent audit records...</p>
        ) : auditLogs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '0.8rem' }}>
            <strong>No audit logs available</strong>
            <p>Perform authenticated actions to generate entries.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll" style={{ marginTop: '0.8rem' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Actor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 25).map((row) => (
                  <tr key={row.id}>
                    <td>{row.type ?? 'unknown'}</td>
                    <td className="mono">{row.adminEmail ?? row.adminUid ?? row.performedBy ?? 'unknown'}</td>
                    <td className="mono">{toDateTimeLabel(row.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}