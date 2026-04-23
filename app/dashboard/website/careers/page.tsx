'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumSelect, type PremiumSelectOption } from '@/components/premium-select';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type CareerStatus = 'open' | 'paused' | 'closed' | 'draft';

const ROLE_STATUS_OPTIONS: PremiumSelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' },
];

interface Career {
  id: string;
  title?: string;
  role?: string;
  department?: string;
  location?: string;
  status?: string;
  createdAt?: unknown;
}

interface Application {
  id: string;
  roleApplied?: string;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'assigned' | 'rejected';
}

function resolveStatus(value: string | undefined): CareerStatus {
  const normalized = value?.toLowerCase();
  if (normalized === 'open' || normalized === 'paused' || normalized === 'closed' || normalized === 'draft') {
    return normalized;
  }
  return 'open';
}

function toDateLabel(value: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN');
  }

  if (typeof value === 'object' && value !== null) {
    const withSeconds = value as { seconds?: number; _seconds?: number };
    const rawSeconds = withSeconds.seconds ?? withSeconds._seconds;
    if (typeof rawSeconds === 'number') {
      return new Date(rawSeconds * 1000).toLocaleDateString('en-IN');
    }
  }

  return '-';
}

export default function WebsiteCareersPage() {
  const [roles, setRoles] = useState<Career[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | CareerStatus>('all');

  // per-row actions
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rolesRes, appsRes] = await Promise.all([
          fetch('/api/website/careers', { cache: 'no-store' }),
          fetch('/api/website/applications', { cache: 'no-store' })
        ]);

        if (!rolesRes.ok || !appsRes.ok) {
          throw new Error('Failed to load careers dashboard data');
        }

        const [rolesBody, appsBody] = (await Promise.all([rolesRes.json(), appsRes.json()])) as [
          ApiResult<Career[]>,
          ApiResult<Application[]>
        ];

        if (!cancelled) {
          setRoles(rolesBody.success && rolesBody.data ? rolesBody.data : []);
          setApplications(appsBody.success && appsBody.data ? appsBody.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load careers data');
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleStatus = async (id: string, current: CareerStatus) => {
    const next: CareerStatus = current === 'open' ? 'paused' : 'open';
    setTogglingId(id);
    try {
      const res = await fetch(`/api/website/careers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/website/careers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete listing');
      setRoles((prev) => prev.filter((r) => r.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const applicantsByRole = useMemo(() => {
    const map = new Map<string, number>();
    for (const app of applications) {
      const key = app.roleApplied?.trim().toLowerCase();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [applications]);

  const filtered = useMemo(() => {
    return roles.filter((row) => {
      const rowStatus = resolveStatus(row.status);
      return status === 'all' ? true : rowStatus === status;
    });
  }, [roles, status]);

  const counts = useMemo(() => {
    return roles.reduce(
      (acc, row) => {
        const rowStatus = resolveStatus(row.status);
        if (rowStatus === 'open') acc.open += 1;
        if (rowStatus === 'paused') acc.paused += 1;
        if (rowStatus === 'closed') acc.closed += 1;
        return acc;
      },
      { open: 0, paused: 0, closed: 0 }
    );
  }, [roles]);

  const pendingApps = useMemo(
    () => applications.filter((item) => (item.status ?? 'pending') === 'pending').length,
    [applications]
  );

  const router = useRouter();

  return (
    <DashboardShell
      title="Careers"
      description="Live role catalog with hiring status and application pipeline mapping from website collections."
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Open Roles</span>
          <strong>{loading ? '...' : counts.open.toLocaleString('en-IN')}</strong>
          <small>Currently accepting applications</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Paused Roles</span>
          <strong>{loading ? '...' : counts.paused.toLocaleString('en-IN')}</strong>
          <small>Temporarily halted</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Pending Applications</span>
          <strong>{loading ? '...' : pendingApps.toLocaleString('en-IN')}</strong>
          <small>Applicants waiting for review</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Visible Roles</span>
          <strong>{loading ? '...' : filtered.length.toLocaleString('en-IN')}</strong>
          <small>After status filter</small>
        </article>
      </section>

      <section style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div className="dashboard-filters" style={{ flex: 1, marginTop: 0 }}>
          <label>
            <span className="subtle">Role status</span>
            <PremiumSelect
              value={status}
              options={ROLE_STATUS_OPTIONS}
              onChange={(nextValue) => setStatus(nextValue as 'all' | CareerStatus)}
              ariaLabel="Role status filter"
            />
          </label>
        </div>
        <button className="btn btn-solid" style={{ fontSize: '0.8rem' }} onClick={() => router.push('/dashboard/website/careers/create')}>
          + New Listing
        </button>
      </section>

      {/* Create form removed — use /dashboard/website/careers/create */}

      {error ? <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div> : null}

      <section className="panel" style={{ marginTop: error ? '1rem' : '1rem' }}>
        {loading ? (
          <p className="subtle">Loading careers...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No career roles found</strong>
            <p>Create a new listing above or sync career entries in the website database.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const roleName = row.title ?? row.role ?? 'Untitled role';
                  const roleKey = roleName.trim().toLowerCase();
                  const applicants = applicantsByRole.get(roleKey) ?? 0;
                  const rowStatus = resolveStatus(row.status);

                  return (
                    <tr key={row.id}>
                      <td>{roleName}</td>
                      <td>{row.department ?? '-'}</td>
                      <td>{row.location ?? '-'}</td>
                      <td>
                        <span
                          className={`status-pill ${rowStatus === 'open' ? 'status-ok' : rowStatus === 'paused' ? 'status-warn' : 'status-error'}`}
                        >
                          {rowStatus}
                        </span>
                      </td>
                      <td className="mono">{applicants.toLocaleString('en-IN')}</td>
                      <td className="mono">{toDateLabel(row.createdAt)}</td>
                      <td>
                        <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-soft"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                            onClick={() => router.push(`/dashboard/website/careers/${row.id}/edit`)}
                          >
                            Edit
                          </button>
                          {(rowStatus === 'open' || rowStatus === 'paused') && (
                            <button
                              className="btn btn-soft"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              disabled={togglingId === row.id}
                              onClick={() => handleToggleStatus(row.id, rowStatus)}
                            >
                              {togglingId === row.id ? '…' : rowStatus === 'open' ? 'Pause' : 'Open'}
                            </button>
                          )}
                          {confirmId === row.id ? (
                            <>
                              <button
                                className="btn btn-danger"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                disabled={deletingId === row.id}
                                onClick={() => handleDelete(row.id)}
                              >
                                {deletingId === row.id ? 'Deleting…' : 'Confirm'}
                              </button>
                              <button
                                className="btn btn-soft"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => setConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-soft"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--danger)' }}
                              onClick={() => setConfirmId(row.id)}
                            >
                              Delete
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}