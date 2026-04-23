'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Employee {
  id: string;
  name: string;
  role?: string;
  employeeId: string;
  email?: string;
  status?: 'active' | 'banned';
  createdAt?: string;
}

interface AccessLog {
  id: string;
  employeeId?: string;
  employeeName?: string;
  action?: string;
  timestamp?: unknown;
}

function IcShield({ s = 20 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IcIdCard({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2"/><path d="M16 14h2"/><circle cx="9" cy="12" r="3"/><path d="M6 17.5a3 3 0 0 1 6 0"/>
    </svg>
  );
}
function IcActivity({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function IcSettings({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IcArrow({ s = 12 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

const COLOR = '#4ade80';
const COLOR_BG = 'rgba(74,222,128,0.12)';

function toDateLabel(value: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('en-IN');
  }
  if (typeof value === 'object' && value !== null) {
    const v = value as { seconds?: number; _seconds?: number };
    const s = v.seconds ?? v._seconds;
    if (typeof s === 'number') return new Date(s * 1000).toLocaleString('en-IN');
  }
  return '-';
}

export default function AccessOverviewPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs]           = useState<AccessLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [er, lr] = await Promise.all([
          fetch('/api/access/employees', { cache: 'no-store' }),
          fetch('/api/access/logs',      { cache: 'no-store' }),
        ]);
        const [eb, lb] = await Promise.all([
          er.ok ? (er.json() as Promise<ApiResult<Employee[]>>)  : Promise.resolve({ success: false } as ApiResult<Employee[]>),
          lr.ok ? (lr.json() as Promise<ApiResult<AccessLog[]>>) : Promise.resolve({ success: false } as ApiResult<AccessLog[]>),
        ]);
        if (!cancelled) {
          setEmployees(eb.success && eb.data ? eb.data : []);
          setLogs(lb.success && lb.data ? lb.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load access data');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activeCount  = useMemo(() => employees.filter(e => (e.status ?? 'active') === 'active').length, [employees]);
  const bannedCount  = useMemo(() => employees.filter(e => e.status === 'banned').length, [employees]);

  const n = (v: number) => loading ? '–' : v.toLocaleString('en-IN');

  const recentLogs = useMemo(() => logs.slice(0, 6), [logs]);

  const NAV_CARDS = [
    {
      href: '/dashboard/access/employees',
      icon: <IcIdCard />,
      title: 'Employees',
      desc: 'Manage staff RFID profiles, ban and unban accounts.',
      badge: bannedCount > 0 ? `${n(bannedCount)} banned` : `${n(activeCount)} active`,
      badgeColor: bannedCount > 0 ? '#fb7185' : '#4ade80',
    },
    {
      href: '/dashboard/access/logs',
      icon: <IcActivity />,
      title: 'Access Logs',
      desc: 'Real-time entry and exit logs from RFID readers.',
      badge: logs.length > 0 ? `${n(logs.length)} entries` : null,
      badgeColor: '#38bdf8',
    },
    {
      href: '/dashboard/access/settings',
      icon: <IcSettings />,
      title: 'Settings',
      desc: 'Remote door unlock and access control configuration.',
      badge: null,
      badgeColor: '#a78bfa',
    },
  ];

  return (
    <DashboardShell
      title="Access Control"
      description="Module overview — employee RFID management and entry logs"
    >
      {/* Page header */}
      <div className="module-page-header">
        <div className="module-page-header-left">
          <div className="module-page-icon" style={{ background: COLOR_BG, color: COLOR }}>
            <IcShield s={22} />
          </div>
          <div>
            <h1 className="module-page-title" style={{ color: COLOR }}>Access Control</h1>
            <p className="module-page-subtitle">RFID-based employee access management system</p>
          </div>
        </div>
      </div>

      {error ? <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div> : null}

      {/* Stats */}
      <section className="stats-grid">
        <article className="metric-card metric-card-accent-access">
          <span className="eyebrow">Total Staff</span>
          <strong style={{ color: COLOR }}>{n(employees.length)}</strong>
          <small>Registered in the system</small>
        </article>
        <article className="metric-card metric-card-accent-access">
          <span className="eyebrow">Active Access</span>
          <strong style={{ color: COLOR }}>{n(activeCount)}</strong>
          <small>Valid RFID profiles</small>
        </article>
        <article className="metric-card" style={{ borderColor: bannedCount > 0 ? 'rgba(251,113,133,0.28)' : undefined }}>
          <span className="eyebrow">Banned</span>
          <strong style={{ color: bannedCount > 0 ? 'var(--danger)' : 'var(--muted)' }}>{n(bannedCount)}</strong>
          <small>Restricted accounts</small>
        </article>
        <article className="metric-card metric-card-accent-access">
          <span className="eyebrow">Log Entries</span>
          <strong style={{ color: COLOR }}>{n(logs.length)}</strong>
          <small>Total access events</small>
        </article>
      </section>

      {/* Navigation cards */}
      <div className="overview-nav-grid" style={{ marginTop: '1.4rem' }}>
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="overview-nav-card"
            style={{ borderColor: 'rgba(74,222,128,0.18)' }}
          >
            <div className="overview-nav-card-icon" style={{ background: COLOR_BG, color: COLOR }}>
              {card.icon}
            </div>
            <div className="overview-nav-card-title">{card.title}</div>
            <div className="overview-nav-card-desc">{card.desc}</div>
            {card.badge ? (
              <span
                className="overview-nav-card-badge"
                style={{ background: `${card.badgeColor}18`, color: card.badgeColor, border: `1px solid ${card.badgeColor}30` }}
              >
                {card.badge}
              </span>
            ) : null}
            <div className="overview-nav-card-arrow">
              <IcArrow />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent logs */}
      {(loading || logs.length > 0) && (
        <div className="panel" style={{ marginTop: '1.4rem', borderColor: 'rgba(74,222,128,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Recent Access Events</h2>
            <Link href="/dashboard/access/logs" style={{ fontSize: '0.76rem', color: COLOR, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View all <IcArrow />
            </Link>
          </div>
          {loading ? (
            <p className="subtle">Loading…</p>
          ) : recentLogs.length === 0 ? (
            <div className="empty-state">
              <strong>No access logs</strong>
              <p>Entry events will appear here automatically.</p>
            </div>
          ) : (
            <div className="activity-feed">
              {recentLogs.map((log) => (
                <div key={log.id} className="activity-item">
                  <div className="activity-dot" style={{ background: COLOR }} />
                  <div className="activity-text">
                    <div className="activity-title">{log.employeeName ?? log.employeeId ?? 'Unknown'}</div>
                    <div className="activity-meta">{log.action ?? 'Access event'}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', flexShrink: 0 }}>
                    {toDateLabel(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Banned employees quick view */}
      {bannedCount > 0 && !loading && (
        <div className="panel" style={{ marginTop: '1rem', borderColor: 'rgba(251,113,133,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--danger)' }}>
              Banned Employees ({n(bannedCount)})
            </h2>
            <Link href="/dashboard/access/employees" style={{ fontSize: '0.76rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Manage <IcArrow />
            </Link>
          </div>
          <div className="activity-feed">
            {employees.filter(e => e.status === 'banned').slice(0, 4).map(emp => (
              <div key={emp.id} className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--danger)' }} />
                <div className="activity-text">
                  <div className="activity-title">{emp.name}</div>
                  <div className="activity-meta">{emp.role ?? 'Employee'} · ID: {emp.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
