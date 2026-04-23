'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Post        { id: string; title?: string; status?: string; authorName?: string; author?: string; createdAt?: unknown; }
interface Message     { id: string; name?: string; subject?: string; isRead?: boolean; replied?: boolean; status?: string; createdAt?: unknown; }
interface Career      { id: string; title?: string; role?: string; status?: string; }
interface Application { id: string; applicantName?: string; roleApplied?: string; status?: string; createdAt?: string; }

function resolveMessageState(row: Message): 'unread' | 'read' | 'replied' {
  if (row.replied === true || row.status?.toLowerCase() === 'replied') return 'replied';
  if (row.isRead === true || row.status?.toLowerCase() === 'read') return 'read';
  return 'unread';
}

function IcGlobe({ s = 20 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IcFileText({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
function IcMail({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function IcBriefcase({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
function IcUsers({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IcBarChart({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
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

const COLOR = '#a78bfa';
const COLOR_BG = 'rgba(167,139,250,0.12)';

export default function WebsiteOverviewPage() {
  const [posts, setPosts]               = useState<Post[]>([]);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [careers, setCareers]           = useState<Career[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [pr, mr, cr, ar] = await Promise.all([
          fetch('/api/website/posts',        { cache: 'no-store' }),
          fetch('/api/website/messages',     { cache: 'no-store' }),
          fetch('/api/website/careers',      { cache: 'no-store' }),
          fetch('/api/website/applications', { cache: 'no-store' }),
        ]);
        const [pb, mb, cb, ab] = await Promise.all([
          pr.ok ? (pr.json() as Promise<ApiResult<Post[]>>)        : Promise.resolve({ success: false } as ApiResult<Post[]>),
          mr.ok ? (mr.json() as Promise<ApiResult<Message[]>>)     : Promise.resolve({ success: false } as ApiResult<Message[]>),
          cr.ok ? (cr.json() as Promise<ApiResult<Career[]>>)      : Promise.resolve({ success: false } as ApiResult<Career[]>),
          ar.ok ? (ar.json() as Promise<ApiResult<Application[]>>) : Promise.resolve({ success: false } as ApiResult<Application[]>),
        ]);
        if (!cancelled) {
          setPosts(pb.success && pb.data ? pb.data : []);
          setMessages(mb.success && mb.data ? mb.data : []);
          setCareers(cb.success && cb.data ? cb.data : []);
          setApplications(ab.success && ab.data ? ab.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load website data');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const publishedPosts  = useMemo(() => posts.filter(p => p.status === 'published').length, [posts]);
  const draftPosts      = useMemo(() => posts.filter(p => (p.status ?? 'draft') === 'draft').length, [posts]);
  const unreadMessages  = useMemo(() => messages.filter(m => resolveMessageState(m) === 'unread').length, [messages]);
  const openCareers     = useMemo(() => careers.filter(c => (c.status ?? 'open') === 'open').length, [careers]);
  const pendingApps     = useMemo(() => applications.filter(a => (a.status ?? 'pending') === 'pending').length, [applications]);

  const n = (v: number) => loading ? '–' : v.toLocaleString('en-IN');

  const recentApps = useMemo(() => applications.slice(0, 6), [applications]);

  const NAV_CARDS: Array<{ href: Route; icon: JSX.Element; title: string; desc: string; badge: string | null; badgeColor: string }> = [
    {
      href: '/dashboard/website/posts' as Route,
      icon: <IcFileText />,
      title: 'Blog Posts',
      desc: 'Create, publish and manage all website blog content.',
      badge: posts.length > 0 ? `${n(publishedPosts)} live` : null,
      badgeColor: '#a78bfa',
    },
    {
      href: '/dashboard/website/messages' as Route,
      icon: <IcMail />,
      title: 'Messages',
      desc: 'Contact form submissions from visitors.',
      badge: unreadMessages > 0 ? `${n(unreadMessages)} unread` : null,
      badgeColor: '#fb7185',
    },
    {
      href: '/dashboard/website/careers' as Route,
      icon: <IcBriefcase />,
      title: 'Careers',
      desc: 'Job listings and internship role management.',
      badge: openCareers > 0 ? `${n(openCareers)} open` : null,
      badgeColor: '#4ade80',
    },
    {
      href: '/dashboard/website/applications' as Route,
      icon: <IcUsers />,
      title: 'Applications',
      desc: 'Review and manage internship applications.',
      badge: pendingApps > 0 ? `${n(pendingApps)} pending` : null,
      badgeColor: '#fbbf24',
    },
    {
      href: '/dashboard/website/analytics' as Route,
      icon: <IcBarChart />,
      title: 'Analytics',
      desc: 'Website performance metrics and traffic data.',
      badge: null,
      badgeColor: '#38bdf8',
    },
  ];

  return (
    <DashboardShell
      title="Website"
      description="Module overview — content, messaging, and hiring pipeline"
      badges={{ '/dashboard/website/applications': pendingApps }}
    >
      {/* Page header */}
      <div className="module-page-header">
        <div className="module-page-header-left">
          <div className="module-page-icon" style={{ background: COLOR_BG, color: COLOR }}>
            <IcGlobe s={22} />
          </div>
          <div>
            <h1 className="module-page-title" style={{ color: COLOR }}>Website</h1>
            <p className="module-page-subtitle">DGEN public website — content, contacts &amp; careers</p>
          </div>
        </div>
        <Link
          href={'/dashboard/website/posts/create' as Route}
          className="btn btn-soft"
          style={{ fontSize: '0.8rem', borderColor: 'rgba(167,139,250,0.28)', color: COLOR }}
        >
          + New Post
        </Link>
      </div>

      {error ? <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div> : null}

      {/* Stats */}
      <section className="stats-grid">
        <article className="metric-card metric-card-accent-website">
          <span className="eyebrow">Total Posts</span>
          <strong style={{ color: COLOR }}>{n(posts.length)}</strong>
          <small>{n(publishedPosts)} published · {n(draftPosts)} draft</small>
        </article>
        <article className="metric-card metric-card-accent-website">
          <span className="eyebrow">Messages</span>
          <strong style={{ color: COLOR }}>{n(messages.length)}</strong>
          <small>{n(unreadMessages)} unread</small>
        </article>
        <article className="metric-card metric-card-accent-website">
          <span className="eyebrow">Open Roles</span>
          <strong style={{ color: COLOR }}>{n(openCareers)}</strong>
          <small>of {n(careers.length)} total listings</small>
        </article>
        <article className="metric-card metric-card-accent-warn" style={{ borderColor: pendingApps > 0 ? 'rgba(251,191,36,0.28)' : undefined }}>
          <span className="eyebrow">Pending Apps</span>
          <strong style={{ color: pendingApps > 0 ? 'var(--warning)' : COLOR }}>{n(pendingApps)}</strong>
          <small>of {n(applications.length)} total applications</small>
        </article>
      </section>

      {/* Navigation cards */}
      <div className="overview-nav-grid" style={{ marginTop: '1.4rem' }}>
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="overview-nav-card"
            style={{ borderColor: 'rgba(167,139,250,0.18)' }}
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

      {/* Recent applications */}
      {applications.length > 0 && (
        <div className="panel" style={{ marginTop: '1.4rem', borderColor: 'rgba(167,139,250,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Recent Applications</h2>
            <Link href={'/dashboard/website/applications' as Route} style={{ fontSize: '0.76rem', color: COLOR, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View all <IcArrow />
            </Link>
          </div>
          {loading ? (
            <p className="subtle">Loading…</p>
          ) : (
            <div className="activity-feed">
              {recentApps.map((app) => {
                const statusColors: Record<string, string> = {
                  pending: 'var(--warning)', reviewed: 'var(--brand-sky)',
                  shortlisted: 'var(--brand)', assigned: 'var(--brand-violet)', rejected: 'var(--danger)',
                };
                const st = app.status ?? 'pending';
                return (
                  <div key={app.id} className="activity-item">
                    <div className="activity-dot" style={{ background: statusColors[st] ?? 'var(--muted)' }} />
                    <div className="activity-text">
                      <div className="activity-title">{app.applicantName ?? 'Unknown applicant'}</div>
                      <div className="activity-meta">
                        {app.roleApplied ?? 'No role specified'} &nbsp;·&nbsp;
                        <span style={{ color: statusColors[st] ?? 'var(--muted)', fontWeight: 600 }}>{st}</span>
                      </div>
                    </div>
                    {app.createdAt ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', flexShrink: 0 }}>
                        {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
