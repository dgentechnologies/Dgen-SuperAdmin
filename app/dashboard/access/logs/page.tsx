'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type LogAction = 'granted' | 'denied' | 'remote_unlock';

interface AccessLog {
  id: string;
  employeeName?: string;
  employeeId?: string;
  action?: LogAction;
  method?: string;
  timestamp?: string;
}

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<'all' | LogAction>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/access/logs', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load access logs');
        const body = (await response.json()) as ApiResult<AccessLog[]>;
        if (!cancelled) {
          setLogs(body.success && body.data ? body.data : []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load access logs');
          setLoading(false);
        }
      }
    };

    fetchLogs();
    const interval = window.setInterval(fetchLogs, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((row) => {
      const action = row.action ?? 'granted';
      const matchesAction = actionFilter === 'all' ? true : action === actionFilter;

      const ts = row.timestamp ? new Date(row.timestamp) : null;
      const fromOk = fromDate ? (!!ts && ts >= new Date(`${fromDate}T00:00:00`)) : true;
      const toOk = toDate ? (!!ts && ts <= new Date(`${toDate}T23:59:59`)) : true;

      return matchesAction && fromOk && toOk;
    });
  }, [logs, actionFilter, fromDate, toDate]);

  const grantedCount = useMemo(
    () => filtered.filter((row) => (row.action ?? 'granted') === 'granted').length,
    [filtered]
  );
  const deniedCount = useMemo(
    () => filtered.filter((row) => (row.action ?? 'granted') === 'denied').length,
    [filtered]
  );
  const unlockCount = useMemo(
    () => filtered.filter((row) => (row.action ?? 'granted') === 'remote_unlock').length,
    [filtered]
  );

  const exportCsv = () => {
    const headers = ['Employee Name', 'Employee ID', 'Action', 'Method', 'Timestamp'];
    const lines = filtered.map((row) => [
      row.employeeName ?? '-',
      row.employeeId ?? '-',
      row.action ?? '-',
      row.method ?? '-',
      row.timestamp ?? '-'
    ]);
    const csv = [headers, ...lines]
      .map((parts) => parts.map((piece) => `"${String(piece).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `access-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title="Access Logs"
      description="Live facility event stream with automatic refresh, audit visibility, and CSV export for compliance reviews."
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Granted</span>
          <strong>{loading ? '...' : grantedCount.toLocaleString('en-IN')}</strong>
          <small>Successful entries in filter range</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Denied</span>
          <strong>{loading ? '...' : deniedCount.toLocaleString('en-IN')}</strong>
          <small>Denied attempts in filter range</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Remote Unlocks</span>
          <strong>{loading ? '...' : unlockCount.toLocaleString('en-IN')}</strong>
          <small>Manual unlock operations</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Visible Logs</span>
          <strong>{loading ? '...' : filtered.length.toLocaleString('en-IN')}</strong>
          <small>Records currently listed</small>
        </article>
      </section>

      <section className="dashboard-filters" style={{ marginTop: '1rem' }}>
        <label>
          <span className="subtle">From date</span>
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} aria-label="From date" />
        </label>
        <label>
          <span className="subtle">To date</span>
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} aria-label="To date" />
        </label>
        <label>
          <span className="subtle">Action type</span>
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value as 'all' | LogAction)}
            aria-label="Action filter"
          >
            <option value="all">All actions</option>
            <option value="granted">Granted</option>
            <option value="denied">Denied</option>
            <option value="remote_unlock">Remote unlock</option>
          </select>
        </label>
        <div style={{ alignSelf: 'end' }}>
          <button type="button" className="btn btn-solid" onClick={exportCsv} aria-label="Export CSV">
            Export CSV
          </button>
        </div>
      </section>

      {error ? <div className="login-error">{error}</div> : null}

      <section className="panel" style={{ marginTop: error ? '1rem' : '0' }}>
        {loading ? (
          <p className="subtle">Loading access logs...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No logs available</strong>
            <p>There are no access events for this filter combination.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Action</th>
                  <th>Method</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const action = row.action ?? 'granted';
                  const actionClass = action === 'granted' ? 'status-ok' : action === 'denied' ? 'status-error' : 'status-warn';
                  return (
                    <tr key={row.id}>
                      <td>{row.employeeName ?? 'Unknown'}</td>
                      <td className="mono">{row.employeeId ?? '-'}</td>
                      <td>
                        <span className={`status-pill ${actionClass}`}>{action}</span>
                      </td>
                      <td>{row.method ?? '-'}</td>
                      <td className="mono">{row.timestamp ? new Date(row.timestamp).toLocaleString('en-IN') : '-'}</td>
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