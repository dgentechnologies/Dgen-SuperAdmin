'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Employee {
  id: string;
  status?: 'active' | 'banned';
}

interface AccessLog {
  id: string;
  action?: 'granted' | 'denied' | 'remote_unlock';
  method?: string;
  timestamp?: unknown;
}

function toTimestampMs(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'object' && value !== null) {
    const withSeconds = value as { seconds?: number; _seconds?: number };
    const rawSeconds = withSeconds.seconds ?? withSeconds._seconds;
    if (typeof rawSeconds === 'number') return rawSeconds * 1000;
  }
  return null;
}

function toDateTimeLabel(value: unknown): string {
  const ms = toTimestampMs(value);
  if (!ms) return '-';
  return new Date(ms).toLocaleString('en-IN');
}

export default function AccessSettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [employeesRes, logsRes] = await Promise.all([
        fetch('/api/access/employees', { cache: 'no-store' }),
        fetch('/api/access/logs', { cache: 'no-store' })
      ]);

      if (!employeesRes.ok || !logsRes.ok) throw new Error('Failed to load access configuration data');

      const [employeesBody, logsBody] = (await Promise.all([employeesRes.json(), logsRes.json()])) as [
        ApiResult<Employee[]>,
        ApiResult<AccessLog[]>
      ];

      setEmployees(employeesBody.success && employeesBody.data ? employeesBody.data : []);
      setLogs(logsBody.success && logsBody.data ? logsBody.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load access settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      await load();
      if (cancelled) return;
    };

    initialize();

    const interval = window.setInterval(() => {
      load();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    let denied24h = 0;
    let granted24h = 0;
    let unlock24h = 0;

    for (const row of logs) {
      const ts = toTimestampMs(row.timestamp);
      if (!ts || ts < dayAgo) continue;
      if ((row.action ?? 'granted') === 'denied') denied24h += 1;
      if ((row.action ?? 'granted') === 'granted') granted24h += 1;
      if ((row.action ?? 'granted') === 'remote_unlock') unlock24h += 1;
    }

    const activeEmployees = employees.filter((item) => (item.status ?? 'active') === 'active').length;
    const bannedEmployees = employees.filter((item) => (item.status ?? 'active') === 'banned').length;

    return {
      activeEmployees,
      bannedEmployees,
      denied24h,
      granted24h,
      unlock24h
    };
  }, [employees, logs]);

  const methodCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of logs) {
      const method = row.method?.trim() || 'unknown';
      map.set(method, (map.get(method) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  const latestUnlock = useMemo(() => {
    return logs.find((row) => (row.action ?? 'granted') === 'remote_unlock');
  }, [logs]);

  const triggerRemoteUnlock = async () => {
    setUnlocking(true);
    setUnlockMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/access/unlock', { method: 'POST' });
      const body = (await response.json()) as ApiResult<{ message?: string }>;
      if (!response.ok || !body.success) {
        throw new Error(body.error ?? 'Failed to trigger remote unlock');
      }

      setUnlockMessage(body.data?.message ?? 'Unlock command sent successfully');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger remote unlock');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <DashboardShell
      title="Access Settings"
      description="Live access-control operations with real employee status, event telemetry, and remote unlock controls."
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Active Employees</span>
          <strong>{loading ? '...' : metrics.activeEmployees.toLocaleString('en-IN')}</strong>
          <small>Profiles currently permitted</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Banned Employees</span>
          <strong>{loading ? '...' : metrics.bannedEmployees.toLocaleString('en-IN')}</strong>
          <small>Profiles blocked in access control</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Denied (24h)</span>
          <strong>{loading ? '...' : metrics.denied24h.toLocaleString('en-IN')}</strong>
          <small>Denied scans in last day</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Remote Unlocks (24h)</span>
          <strong>{loading ? '...' : metrics.unlock24h.toLocaleString('en-IN')}</strong>
          <small>Manual unlock operations</small>
        </article>
      </section>

      {error ? <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div> : null}
      {unlockMessage ? <div className="status-pill status-ok" style={{ marginTop: '1rem' }}>{unlockMessage}</div> : null}

      <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
        <article className="panel accent">
          <h2>Remote Controls</h2>
          <p style={{ marginTop: '0.55rem' }}>
            Last remote unlock event: <strong>{latestUnlock ? toDateTimeLabel(latestUnlock.timestamp) : 'No recent event'}</strong>
          </p>
          <p className="subtle" style={{ marginTop: '0.55rem' }}>
            Triggering unlock sends a command to Realtime Database and records an audit event.
          </p>
          <button
            type="button"
            className="btn btn-solid"
            style={{ marginTop: '0.9rem' }}
            onClick={triggerRemoteUnlock}
            disabled={unlocking}
          >
            {unlocking ? 'Sending unlock...' : 'Trigger Remote Unlock'}
          </button>
        </article>

        <article className="panel">
          <h2>Event Method Distribution</h2>
          {loading ? (
            <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading method analytics...</p>
          ) : methodCounts.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '0.8rem' }}>
              <strong>No methods recorded</strong>
              <p>Access events will appear here once logs are available.</p>
            </div>
          ) : (
            <div className="stack" style={{ marginTop: '0.8rem' }}>
              {methodCounts.map((row) => (
                <div key={row.method} className="status-pill" style={{ justifyContent: 'space-between' }}>
                  <span>{row.method}</span>
                  <span className="mono">{row.count.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>Recent Access Events</h2>
        {loading ? (
          <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading recent events...</p>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '0.8rem' }}>
            <strong>No access logs found</strong>
            <p>Events will populate when access activity is captured.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll" style={{ marginTop: '0.8rem' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Method</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 20).map((row) => {
                  const action = row.action ?? 'granted';
                  const className = action === 'granted' ? 'status-ok' : action === 'denied' ? 'status-error' : 'status-warn';
                  return (
                    <tr key={row.id}>
                      <td>
                        <span className={`status-pill ${className}`}>{action}</span>
                      </td>
                      <td>{row.method ?? 'unknown'}</td>
                      <td className="mono">{toDateTimeLabel(row.timestamp)}</td>
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