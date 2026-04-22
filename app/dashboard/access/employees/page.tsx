'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Employee {
  id: string;
  name: string;
  role?: string;
  employeeId: string;
  rfidUid?: string;
  email?: string;
  status?: 'active' | 'banned';
  banReason?: string;
  createdAt?: string;
}

type FilterStatus = 'all' | 'active' | 'banned';

export default function AccessEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [banTarget, setBanTarget] = useState<Employee | null>(null);
  const [banReason, setBanReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/access/employees', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load employee directory');
      const body = (await response.json()) as ApiResult<Employee[]>;
      setEmployees(body.success && body.data ? body.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error while loading employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter((row) => {
      const rowStatus = row.status ?? 'active';
      const matchesStatus = status === 'all' ? true : rowStatus === status;
      const haystack = `${row.name} ${row.employeeId} ${row.email ?? ''} ${row.role ?? ''}`.toLowerCase();
      const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;
      return matchesStatus && matchesQuery;
    });
  }, [employees, query, status]);

  const activeCount = useMemo(
    () => employees.filter((item) => (item.status ?? 'active') === 'active').length,
    [employees]
  );
  const bannedCount = useMemo(
    () => employees.filter((item) => (item.status ?? 'active') === 'banned').length,
    [employees]
  );

  const maskRfid = (uid?: string) => {
    if (!uid) return '-';
    const segments = uid.split(':');
    if (segments.length <= 2) return uid;
    return segments.map((segment, index) => (index <= 1 ? segment : 'xx')).join(':');
  };

  const submitBan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!banTarget) return;

    const reason = banReason.trim();
    if (reason.length < 5) {
      setError('Ban reason must be at least 5 characters');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/access/employees/${banTarget.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to ban employee');

      setBanTarget(null);
      setBanReason('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete ban action');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Access Employees"
      description="Professional employee control center for RFID status, account governance, and compliance actions."
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Active</span>
          <strong>{loading ? '...' : activeCount.toLocaleString('en-IN')}</strong>
          <small>Employees with valid access</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Banned</span>
          <strong>{loading ? '...' : bannedCount.toLocaleString('en-IN')}</strong>
          <small>Restricted RFID profiles</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Directory</span>
          <strong>{loading ? '...' : employees.length.toLocaleString('en-IN')}</strong>
          <small>Total registered employees</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Search Result</span>
          <strong>{loading ? '...' : filtered.length.toLocaleString('en-IN')}</strong>
          <small>Matching current filter</small>
        </article>
      </section>

      <section className="dashboard-filters" style={{ marginTop: '1rem' }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, ID, role, or email"
          aria-label="Search employees"
        />
        <div className="filter-chip-row">
          {(['all', 'active', 'banned'] as FilterStatus[]).map((value) => (
            <button
              key={value}
              type="button"
              className={`filter-chip ${status === value ? 'active' : ''}`}
              onClick={() => setStatus(value)}
              aria-label={`Filter ${value}`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="login-error">{error}</div> : null}

      <section className="panel" style={{ marginTop: error ? '1rem' : '0' }}>
        {loading ? (
          <p className="subtle">Loading employees...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No employees found</strong>
            <p>Adjust filters or query to locate employee records.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Employee ID</th>
                  <th>RFID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const rowStatus = row.status ?? 'active';
                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.name}</strong>
                        <p className="subtle">{row.email ?? 'No email'}</p>
                      </td>
                      <td>{row.role ?? 'Employee'}</td>
                      <td className="mono">{row.employeeId}</td>
                      <td className="mono">{maskRfid(row.rfidUid)}</td>
                      <td>
                        <span className={`status-pill ${rowStatus === 'active' ? 'status-ok' : 'status-error'}`}>
                          {rowStatus}
                        </span>
                        {row.banReason ? <p className="subtle">Reason: {row.banReason}</p> : null}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={() => {
                            if (rowStatus === 'banned') return;
                            setBanTarget(row);
                          }}
                          disabled={rowStatus === 'banned'}
                          aria-label={`Ban ${row.name}`}
                        >
                          {rowStatus === 'banned' ? 'Already banned' : 'Ban employee'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {banTarget ? (
        <section className="panel accent" style={{ marginTop: '1rem' }}>
          <h2>Confirm Ban Action</h2>
          <p style={{ marginTop: '0.55rem' }}>
            You are about to ban <strong>{banTarget.name}</strong> ({banTarget.employeeId}).
          </p>
          <form className="stack" style={{ marginTop: '1rem' }} onSubmit={submitBan}>
            <label>
              Ban reason
              <textarea
                rows={4}
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
                className="login-input"
                placeholder="Enter operational reason"
                aria-label="Ban reason"
                required
                minLength={5}
              />
            </label>
            <div className="filter-chip-row">
              <button type="submit" className="btn btn-solid" disabled={saving}>
                {saving ? 'Submitting...' : 'Confirm Ban'}
              </button>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => {
                  setBanTarget(null);
                  setBanReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </DashboardShell>
  );
}