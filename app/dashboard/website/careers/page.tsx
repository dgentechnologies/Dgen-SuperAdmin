'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type CareerStatus = 'open' | 'paused' | 'closed' | 'draft';

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

interface CreateForm {
  title: string;
  department: string;
  location: string;
  status: CareerStatus;
  type: string;
  workMode: string;
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

const EMPTY_FORM: CreateForm = { title: '', department: '', location: '', status: 'draft', type: '', workMode: '' };

export default function WebsiteCareersPage() {
  const [roles, setRoles] = useState<Career[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | CareerStatus>('all');

  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/website/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          department: form.department.trim() || undefined,
          location: form.location.trim() || undefined,
          status: form.status,
          type: form.type || undefined,
          workMode: form.workMode || undefined,
        }),
      });
      const body = (await res.json()) as ApiResult<{ id: string }>;
      if (!res.ok || !body.success) throw new Error((body as { error?: string }).error ?? 'Failed to create listing');

      // Optimistically append
      setRoles((prev) => [
        { id: body.data!.id, title: form.title, department: form.department || undefined, location: form.location || undefined, status: form.status, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setCreating(false);
    }
  };

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
            <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | CareerStatus)} aria-label="Role status filter">
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
        <button className="btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cancel' : '+ New Listing'}
        </button>
      </section>

      {/* Create form */}
      {showCreate && (
        <section className="panel" style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Create Career Listing</h2>
          {createError && <div className="login-error" style={{ marginBottom: '0.75rem' }}>{createError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label style={{ gridColumn: '1 / -1' }}>
              <span className="subtle">Job Title *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Frontend Engineer"
                required
              />
            </label>
            <label>
              <span className="subtle">Department</span>
              <input
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Engineering"
              />
            </label>
            <label>
              <span className="subtle">Location</span>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Remote / Bengaluru"
              />
            </label>
            <label>
              <span className="subtle">Type</span>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="">Select type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </label>
            <label>
              <span className="subtle">Work Mode</span>
              <select value={form.workMode} onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))}>
                <option value="">Select mode</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label>
              <span className="subtle">Initial Status</span>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CareerStatus }))}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create Listing'}
              </button>
            </div>
          </form>
        </section>
      )}

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
                          {(rowStatus === 'open' || rowStatus === 'paused') && (
                            <button
                              className="btn-ghost"
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
                                className="btn-danger"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                disabled={deletingId === row.id}
                                onClick={() => handleDelete(row.id)}
                              >
                                {deletingId === row.id ? 'Deleting…' : 'Confirm'}
                              </button>
                              <button
                                className="btn-ghost"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => setConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-ghost"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--error)' }}
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