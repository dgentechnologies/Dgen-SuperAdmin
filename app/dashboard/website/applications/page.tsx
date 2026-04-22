'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type AppStatus = 'pending' | 'reviewed' | 'shortlisted' | 'assigned' | 'rejected';

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  roleApplied: string;
  coverNote?: string;
  resumeUrl?: string;
  status?: AppStatus;
  createdAt?: string;
  assignedTo?: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  status?: 'active' | 'banned';
}

const FILTERS: Array<{ value: 'all' | AppStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'rejected', label: 'Rejected' }
];

export default function WebsiteApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<'all' | AppStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [assignPayload, setAssignPayload] = useState({ employeeId: '', note: '', startDate: '' });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, employeesRes] = await Promise.all([
        fetch('/api/website/applications', { cache: 'no-store' }),
        fetch('/api/access/employees?status=active', { cache: 'no-store' })
      ]);

      if (!appsRes.ok) {
        throw new Error('Failed to load applications');
      }

      const appsBody = (await appsRes.json()) as ApiResult<Application[]>;
      const employeesBody = employeesRes.ok
        ? ((await employeesRes.json()) as ApiResult<Employee[]>)
        : ({ success: false } as ApiResult<Employee[]>);

      setItems(appsBody.success && appsBody.data ? appsBody.data : []);
      setEmployees(employeesBody.success && employeesBody.data ? employeesBody.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error while loading applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(
    () => items.filter((item) => (filter === 'all' ? true : (item.status ?? 'pending') === filter)),
    [items, filter]
  );

  const pendingCount = useMemo(
    () => items.filter((item) => (item.status ?? 'pending') === 'pending').length,
    [items]
  );

  const updateStatus = async (id: string, status: AppStatus) => {
    setSavingStatusId(id);
    try {
      const response = await fetch(`/api/website/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Status update failed');

      setItems((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    } finally {
      setSavingStatusId(null);
    }
  };

  const submitAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assigningId || !assignPayload.employeeId) return;

    const selected = employees.find((emp) => emp.id === assignPayload.employeeId);
    if (!selected) {
      setError('Please choose a valid employee for assignment');
      return;
    }

    setSavingStatusId(assigningId);

    try {
      const response = await fetch(`/api/website/applications/${assigningId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selected.id,
          employeeName: selected.name,
          employeeEmail: selected.email,
          note: assignPayload.note || undefined,
          startDate: assignPayload.startDate || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Assignment failed');
      }

      setAssigningId(null);
      setAssignPayload({ employeeId: '', note: '', startDate: '' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign intern');
    } finally {
      setSavingStatusId(null);
    }
  };

  return (
    <DashboardShell
      title="Website Applications"
      description="Review and assign internship applications with direct backend updates and email notification workflow."
      badges={{ '/dashboard/website/applications': pendingCount }}
    >
      <section className="dashboard-filters">
        <div className="filter-chip-row">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`filter-chip ${filter === item.value ? 'active' : ''}`}
              onClick={() => setFilter(item.value)}
              aria-label={`Filter by ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="login-error">{error}</div> : null}

      <section className="panel" style={{ marginTop: error ? '1rem' : '0' }}>
        {loading ? (
          <p className="subtle">Loading applications...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No applications found</strong>
            <p>Try switching filter tabs or refresh after new submissions.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isExpanded = expandedId === row.id;
                  return (
                    <>
                      <tr key={row.id}>
                        <td>
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : row.id)}
                            className="btn btn-soft"
                            aria-label={`Toggle details for ${row.applicantName}`}
                          >
                            {row.applicantName}
                          </button>
                        </td>
                        <td>{row.roleApplied || 'Unknown role'}</td>
                        <td className="mono">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                        <td>
                          <span className="status-pill">{row.status ?? 'pending'}</span>
                        </td>
                        <td>
                          <div className="filter-chip-row">
                            <button
                              type="button"
                              className="btn btn-soft"
                              onClick={() => setAssigningId(row.id)}
                              aria-label={`Assign ${row.applicantName}`}
                            >
                              Assign
                            </button>
                            <button
                              type="button"
                              className="btn btn-soft"
                              onClick={() => updateStatus(row.id, 'reviewed')}
                              disabled={savingStatusId === row.id}
                              aria-label={`Mark ${row.applicantName} reviewed`}
                            >
                              Reviewed
                            </button>
                            <button
                              type="button"
                              className="btn btn-soft"
                              onClick={() => updateStatus(row.id, 'rejected')}
                              disabled={savingStatusId === row.id}
                              aria-label={`Reject ${row.applicantName}`}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr key={`${row.id}-detail`}>
                          <td colSpan={5}>
                            <div className="panel accent">
                              <h3>Application Details</h3>
                              <p style={{ marginTop: '0.5rem' }}>
                                <strong>Email:</strong> {row.applicantEmail}
                              </p>
                              <p style={{ marginTop: '0.5rem' }}>
                                <strong>Cover note:</strong> {row.coverNote || 'No cover note submitted.'}
                              </p>
                              <p style={{ marginTop: '0.5rem' }}>
                                <strong>Resume:</strong>{' '}
                                {row.resumeUrl ? (
                                  <a href={row.resumeUrl} target="_blank" rel="noreferrer" className="status-ok">
                                    Open document
                                  </a>
                                ) : (
                                  'Not attached'
                                )}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {assigningId ? (
        <section className="panel accent" style={{ marginTop: '1rem' }}>
          <h2>Assign Application</h2>
          <p className="subtle" style={{ marginTop: '0.5rem' }}>
            Select an active employee and confirm assignment to trigger the backend notification workflow.
          </p>
          <form className="stack" style={{ marginTop: '1rem' }} onSubmit={submitAssign}>
            <label>
              Employee
              <select
                value={assignPayload.employeeId}
                onChange={(event) => setAssignPayload((prev) => ({ ...prev, employeeId: event.target.value }))}
                aria-label="Select employee"
                className="login-input"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Start date (optional)
              <input
                type="date"
                value={assignPayload.startDate}
                onChange={(event) => setAssignPayload((prev) => ({ ...prev, startDate: event.target.value }))}
                className="login-input"
                aria-label="Start date"
              />
            </label>

            <label>
              Note (optional)
              <textarea
                rows={3}
                value={assignPayload.note}
                onChange={(event) => setAssignPayload((prev) => ({ ...prev, note: event.target.value }))}
                className="login-input"
                aria-label="Assignment note"
              />
            </label>

            <div className="filter-chip-row">
              <button type="submit" className="btn btn-solid" disabled={savingStatusId === assigningId}>
                {savingStatusId === assigningId ? 'Assigning...' : 'Confirm Assign'}
              </button>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => {
                  setAssigningId(null);
                  setAssignPayload({ employeeId: '', note: '', startDate: '' });
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