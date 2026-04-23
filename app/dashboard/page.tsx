'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface WebsitePost { id: string; status?: string; }
interface Employee    { id: string; status?: 'active' | 'banned'; }
interface Application { id: string; status?: string; createdAt?: string; applicantName?: string; roleApplied?: string; }
interface Message     { id: string; read?: boolean; name?: string; createdAt?: string; }
interface Career      { id: string; status?: string; }
interface ExpenseSummary { total: number; count: number; }
interface ModuleHealth  { website: 'ok' | 'error'; access: 'ok' | 'error'; books: 'ok' | 'error'; }

function fail<T>(): ApiResult<T> { return { success: false }; }

/* â”€â”€ tiny inline SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Dot({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: `0 0 0 2px ${color}30`,
    }} />
  );
}

function IcArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function IcGlobe({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IcShield({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IcBook({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

export default function DashboardPage() {
  const [posts, setPosts]               = useState<WebsitePost[]>([]);
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [summary, setSummary]           = useState<ExpenseSummary | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [careers, setCareers]           = useState<Career[]>([]);
  const [health, setHealth]             = useState<ModuleHealth>({ website: 'ok', access: 'ok', books: 'ok' });
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [postsRes, empRes, sumRes, appRes, msgRes, carRes] = await Promise.all([
        fetch('/api/website/posts',        { cache: 'no-store' }),
        fetch('/api/access/employees',     { cache: 'no-store' }),
        fetch('/api/books/expenses/summary',{ cache: 'no-store' }),
        fetch('/api/website/applications', { cache: 'no-store' }),
        fetch('/api/website/messages',     { cache: 'no-store' }),
        fetch('/api/website/careers',      { cache: 'no-store' }),
      ]);
      const nextHealth: ModuleHealth = {
        website: postsRes.ok && appRes.ok ? 'ok' : 'error',
        access:  empRes.ok               ? 'ok' : 'error',
        books:   sumRes.ok               ? 'ok' : 'error',
      };
      const [pb, eb, sb, ab, mb, cb] = await Promise.all([
        postsRes.ok ? postsRes.json() as Promise<ApiResult<WebsitePost[]>>  : Promise.resolve(fail<WebsitePost[]>()),
        empRes.ok   ? empRes.json()   as Promise<ApiResult<Employee[]>>     : Promise.resolve(fail<Employee[]>()),
        sumRes.ok   ? sumRes.json()   as Promise<ApiResult<ExpenseSummary>> : Promise.resolve(fail<ExpenseSummary>()),
        appRes.ok   ? appRes.json()   as Promise<ApiResult<Application[]>>  : Promise.resolve(fail<Application[]>()),
        msgRes.ok   ? msgRes.json()   as Promise<ApiResult<Message[]>>      : Promise.resolve(fail<Message[]>()),
        carRes.ok   ? carRes.json()   as Promise<ApiResult<Career[]>>       : Promise.resolve(fail<Career[]>()),
      ]);
      if (!cancelled) {
        setHealth(nextHealth);
        setPosts(pb.success && pb.data ? pb.data : []);
        setEmployees(eb.success && eb.data ? eb.data : []);
        setSummary(sb.success && sb.data ? sb.data : null);
        setApplications(ab.success && ab.data ? ab.data : []);
        setMessages(mb.success && mb.data ? mb.data : []);
        setCareers(cb.success && cb.data ? cb.data : []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activeEmployees  = useMemo(() => employees.filter(e => (e.status ?? 'active') === 'active').length, [employees]);
  const bannedEmployees  = useMemo(() => employees.filter(e => e.status === 'banned').length, [employees]);
  const pendingApps      = useMemo(() => applications.filter(a => (a.status ?? 'pending') === 'pending').length, [applications]);
  const publishedPosts   = useMemo(() => posts.filter(p => p.status === 'published').length, [posts]);
  const unreadMessages   = useMemo(() => messages.filter(m => !m.read).length, [messages]);
  const openCareers      = useMemo(() => careers.filter(c => (c.status ?? 'open') === 'open').length, [careers]);
  const totalSpend       = Math.round(summary?.total ?? 0);

  const n = (v: number) => loading ? 'â€”' : v.toLocaleString('en-IN');
  const currency = (v: number) => loading ? 'â€”' : `â‚¹${v.toLocaleString('en-IN')}`;

  const recentApps = useMemo(() => applications.slice(0, 5), [applications]);

  return (
    <DashboardShell
      title="Overview"
      description="Unified live view across all three product modules"
      badges={{ '/dashboard/website/applications': pendingApps }}
    >

      {/* â”€â”€ Module cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="overview-modules-grid">

        {/* WEBSITE */}
        <div
          className="module-card"
          style={{ borderColor: health.website === 'ok' ? 'rgba(167,139,250,0.22)' : 'rgba(251,113,133,0.22)' }}
        >
          {/* glow accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 140, height: 100,
            background: 'radial-gradient(circle at top right, rgba(167,139,250,0.14), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="module-card-header">
            <div className="module-card-label">
              <div className="module-card-icon" style={{ background: 'rgba(167,139,250,0.14)', color: '#a78bfa' }}>
                <IcGlobe s={16} />
              </div>
              <span className="module-card-title" style={{ color: '#a78bfa' }}>Website</span>
            </div>
            <span className={`module-status-chip ${health.website === 'ok' ? 'module-status-chip-ok' : 'module-status-chip-err'}`}>
              <Dot color={health.website === 'ok' ? 'var(--brand)' : 'var(--danger)'} />
              {health.website === 'ok' ? 'Live' : 'Error'}
            </span>
          </div>

          <div className="module-card-stats">
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: '#a78bfa' }}>{n(posts.length)}</div>
              <div className="module-stat-label">Total posts</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: '#a78bfa' }}>{n(publishedPosts)}</div>
              <div className="module-stat-label">Published</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: '#a78bfa' }}>{n(pendingApps)}</div>
              <div className="module-stat-label">Pending apps</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: '#a78bfa' }}>{n(unreadMessages)}</div>
              <div className="module-stat-label">Unread msgs</div>
            </div>
          </div>

          <Link
            href="/dashboard/website/applications"
            className="module-card-action"
            style={{ borderColor: 'rgba(167,139,250,0.28)', color: '#a78bfa', background: 'rgba(167,139,250,0.06)' }}
          >
            Manage Website <IcArrow />
          </Link>
        </div>

        {/* ACCESS CONTROL */}
        <div
          className="module-card"
          style={{ borderColor: health.access === 'ok' ? 'rgba(74,222,128,0.22)' : 'rgba(251,113,133,0.22)' }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 140, height: 100,
            background: 'radial-gradient(circle at top right, rgba(74,222,128,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="module-card-header">
            <div className="module-card-label">
              <div className="module-card-icon" style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--brand)' }}>
                <IcShield s={16} />
              </div>
              <span className="module-card-title" style={{ color: 'var(--brand)' }}>Access Control</span>
            </div>
            <span className={`module-status-chip ${health.access === 'ok' ? 'module-status-chip-ok' : 'module-status-chip-err'}`}>
              <Dot color={health.access === 'ok' ? 'var(--brand)' : 'var(--danger)'} />
              {health.access === 'ok' ? 'Live' : 'Error'}
            </span>
          </div>

          <div className="module-card-stats">
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: 'var(--brand)' }}>{n(employees.length)}</div>
              <div className="module-stat-label">Total staff</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: 'var(--brand)' }}>{n(activeEmployees)}</div>
              <div className="module-stat-label">Active access</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: 'var(--danger)' }}>{n(bannedEmployees)}</div>
              <div className="module-stat-label">Banned</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: 'var(--brand)' }}>RFID</div>
              <div className="module-stat-label">Auth method</div>
            </div>
          </div>

          <Link
            href="/dashboard/access/employees"
            className="module-card-action"
            style={{ borderColor: 'rgba(74,222,128,0.26)', color: 'var(--brand)', background: 'rgba(74,222,128,0.06)' }}
          >
            Manage Access <IcArrow />
          </Link>
        </div>

        {/* BOOKS */}
        <div
          className="module-card"
          style={{ borderColor: health.books === 'ok' ? 'rgba(56,189,248,0.22)' : 'rgba(251,113,133,0.22)' }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 140, height: 100,
            background: 'radial-gradient(circle at top right, rgba(56,189,248,0.11), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="module-card-header">
            <div className="module-card-label">
              <div className="module-card-icon" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
                <IcBook s={16} />
              </div>
              <span className="module-card-title" style={{ color: '#38bdf8' }}>Books</span>
            </div>
            <span className={`module-status-chip ${health.books === 'ok' ? 'module-status-chip-ok' : 'module-status-chip-err'}`}>
              <Dot color={health.books === 'ok' ? 'var(--brand)' : 'var(--danger)'} />
              {health.books === 'ok' ? 'Live' : 'Error'}
            </span>
          </div>

          <div className="module-card-stats">
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: '#38bdf8', fontSize: '1rem' }}>{currency(totalSpend)}</div>
              <div className="module-stat-label">Tracked spend</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value" style={{ color: '#38bdf8' }}>{n(summary?.count ?? 0)}</div>
              <div className="module-stat-label">Transactions</div>
            </div>
          </div>

          <Link
            href="/dashboard/books/expenses"
            className="module-card-action"
            style={{ borderColor: 'rgba(56,189,248,0.26)', color: '#38bdf8', background: 'rgba(56,189,248,0.06)' }}
          >
            Manage Books <IcArrow />
          </Link>
        </div>
      </div>

      {/* â”€â”€ Secondary row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="dashboard-grid-wide" style={{ marginTop: '1rem' }}>

        {/* Recent applications */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Recent Applications</h2>
            <Link href="/dashboard/website/applications" style={{ fontSize: '0.76rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View all <IcArrow />
            </Link>
          </div>

          {loading ? (
            <div className="empty-state" style={{ padding: '1.4rem' }}>
              <p className="subtle">Loadingâ€¦</p>
            </div>
          ) : recentApps.length === 0 ? (
            <div className="empty-state">
              <strong>No applications yet</strong>
              <p>Internship applications will appear here as they come in.</p>
            </div>
          ) : (
            <div className="dashboard-table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app) => {
                    const statusColor: Record<string, string> = {
                      pending: 'var(--warning)', reviewed: 'var(--brand-sky)',
                      shortlisted: 'var(--brand)', assigned: 'var(--brand-violet)', rejected: 'var(--danger)',
                    };
                    const st = app.status ?? 'pending';
                    return (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 600 }}>{app.applicantName ?? 'â€”'}</td>
                        <td className="subtle">{app.roleApplied ?? 'â€”'}</td>
                        <td>
                          <span className="status-pill" style={{ color: statusColor[st] ?? 'var(--muted)' }}>
                            {st}
                          </span>
                        </td>
                        <td className="subtle mono">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'â€”'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick stats sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* System health */}
          <div className="panel" style={{ borderColor: 'rgba(74,222,128,0.14)' }}>
            <p className="eyebrow" style={{ marginBottom: '0.65rem' }}>System Health</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {([ 
                { label: 'Website',        ok: health.website === 'ok' },
                { label: 'Access Control', ok: health.access  === 'ok' },
                { label: 'Books',          ok: health.books   === 'ok' },
              ] as const).map(({ label, ok }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--muted-strong)' }}>{label}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    color: ok ? 'var(--brand)' : 'var(--danger)',
                    fontSize: '0.72rem', fontWeight: 700,
                  }}>
                    <Dot color={ok ? 'var(--brand)' : 'var(--danger)'} />
                    {ok ? 'Operational' : 'Error'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Careers */}
          <div className="panel" style={{ borderColor: 'rgba(167,139,250,0.14)' }}>
            <p className="eyebrow" style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Open Positions</p>
            <strong style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              {n(openCareers)}
            </strong>
            <p className="subtle" style={{ marginTop: '0.25rem', fontSize: '0.76rem' }}>Active career listings</p>
            <Link href="/dashboard/website/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.7rem', fontSize: '0.76rem', color: '#a78bfa', fontWeight: 600 }}>
              View careers <IcArrow />
            </Link>
          </div>

          {/* Messages */}
          <div className="panel" style={{ borderColor: 'rgba(56,189,248,0.14)' }}>
            <p className="eyebrow" style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>Contact Inbox</p>
            <strong style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              {n(unreadMessages)}
            </strong>
            <p className="subtle" style={{ marginTop: '0.25rem', fontSize: '0.76rem' }}>Unread messages</p>
            <Link href="/dashboard/website/messages" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.7rem', fontSize: '0.76rem', color: '#38bdf8', fontWeight: 600 }}>
              View messages <IcArrow />
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
