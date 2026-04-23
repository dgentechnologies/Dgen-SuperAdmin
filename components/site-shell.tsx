'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/* ── Inline SVG Icons ─────────────────────────────────────── */
function IcGrid({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IcGlobe({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IcShield({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IcBook({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function IcFileText({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function IcMail({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function IcBriefcase({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
function IcUsers({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IcIdCard({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2"/><path d="M16 14h2"/><path d="M6 10h.01"/><circle cx="9" cy="12" r="3"/><path d="M6 17.5a3 3 0 0 1 6 0"/>
    </svg>
  );
}
function IcActivity({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function IcBarChart({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function IcSettings({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IcDollar({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function IcTrend({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}
function IcChevronDown({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IcLogOut({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IcLock({ s = 12 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

/* ── Nav config ───────────────────────────────────────────── */
type NavItem = { href: Route; label: string; icon: ReactNode };

type NavGroup = {
  key: string;
  title: string;
  color: string;
  shadowColor: string;
  icon: ReactNode;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'website',
    title: 'Website',
    color: '#a78bfa',
    shadowColor: 'rgba(167,139,250,0.18)',
    icon: <IcGlobe s={15} />,
    items: [
      { href: '/dashboard/website/posts',        label: 'Blog',         icon: <IcFileText /> },
      { href: '/dashboard/website/messages',     label: 'Messages',     icon: <IcMail /> },
      { href: '/dashboard/website/analytics',    label: 'Performance',  icon: <IcBarChart /> },
      { href: '/dashboard/website/careers',      label: 'Careers',      icon: <IcBriefcase /> },
      { href: '/dashboard/website/applications', label: 'Applications', icon: <IcUsers /> },
    ],
  },
  {
    key: 'access',
    title: 'Access Control',
    color: '#4ade80',
    shadowColor: 'rgba(74,222,128,0.18)',
    icon: <IcShield s={15} />,
    items: [
      { href: '/dashboard/access/employees', label: 'Employees', icon: <IcIdCard /> },
      { href: '/dashboard/access/logs',      label: 'Logs',      icon: <IcActivity /> },
      { href: '/dashboard/access/settings',  label: 'Settings',  icon: <IcSettings /> },
    ],
  },
  {
    key: 'books',
    title: 'Books',
    color: '#38bdf8',
    shadowColor: 'rgba(56,189,248,0.18)',
    icon: <IcBook s={15} />,
    items: [
      { href: '/dashboard/books/expenses', label: 'Expenses', icon: <IcDollar /> },
      { href: '/dashboard/books/reports',  label: 'Reports',  icon: <IcTrend /> },
    ],
  },
];

/* ── Main Shell ───────────────────────────────────────────── */
export function DashboardShell({
  title,
  description,
  children,
  adminEmail,
  badges,
}: {
  title: string;
  description: string;
  children: ReactNode;
  adminEmail?: string;
  badges?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // Determine which groups start open (the one containing active route)
  const defaultOpen = useMemo(() => {
    const open = new Set<string>();
    for (const group of NAV_GROUPS) {
      if (group.items.some((item) => pathname.startsWith(item.href))) {
        open.add(group.key);
      }
    }
    // If no group matches (e.g. overview), open all
    if (open.size === 0) {
      NAV_GROUPS.forEach((g) => open.add(g.key));
    }
    return open;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpen);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date()),
    []
  );

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <main className="dashboard-shell">
      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <img src="/logo.png" alt="DGEN logo" className="sidebar-logo" />
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {/* Overview */}
          <Link
            href="/dashboard"
            className={`sidebar-link sidebar-link-overview ${pathname === '/dashboard' ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-link-icon"><IcGrid s={15} /></span>
            <span>Overview</span>
          </Link>

          <div className="sidebar-divider" />

          {/* Accordion groups */}
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.has(group.key);
            const groupActive = group.items.some((item) => pathname.startsWith(item.href));
            return (
              <div key={group.key} className="sidebar-group">
                {/* Group header button */}
                <button
                  type="button"
                  className={`sidebar-group-header ${groupActive ? 'sidebar-group-header-active' : ''}`}
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={isOpen}
                  style={{ '--group-color': group.color, '--group-shadow': group.shadowColor } as React.CSSProperties}
                >
                  <span className="sidebar-group-icon" style={{ color: group.color }}>
                    {group.icon}
                  </span>
                  <span className="sidebar-group-title">{group.title}</span>
                  <span
                    className="sidebar-group-chevron"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <IcChevronDown s={13} />
                  </span>
                </button>

                {/* Collapsible items */}
                <div
                  className="sidebar-group-items"
                  style={{ '--item-count': group.items.length } as React.CSSProperties}
                  aria-hidden={!isOpen}
                  data-open={isOpen ? 'true' : 'false'}
                >
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const badge = badges?.[item.href];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                        style={{ '--item-accent': group.color } as React.CSSProperties}
                      >
                        <span className="sidebar-item-icon">{item.icon}</span>
                        <span className="sidebar-item-label">{item.label}</span>
                        {badge ? (
                          <span className="sidebar-item-badge">{badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer — compact admin row + inline signout */}
        <div className="sidebar-footer">
          <div className="sidebar-admin-row">
            <div className="sidebar-admin-avatar">
              {(adminEmail ?? 'S').charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-admin-text">
              <span className="sidebar-admin-name">
                <IcLock s={9} />&nbsp;Super Admin
              </span>
              <span className="sidebar-admin-email">{adminEmail ?? 'Authenticated'}</span>
            </div>
            <button
              type="button"
              className="sidebar-signout-icon"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <IcLogOut s={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <p className="topbar-date">{dateLabel}</p>
            <div className="topbar-breadcrumb">
              {title}
            </div>
          </div>
          <div className="topbar-status">
            <span className="topbar-live-dot" />
            <span>Live</span>
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
      </section>
    </main>
  );
}

/* ── Table helper ─────────────────────────────────────────── */
export function DashboardTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="panel dashboard-table-wrap">
      <h2 className="panel-title">{title}</h2>
      <div className="dashboard-table-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Stats strip ──────────────────────────────────────────── */
export function StatsStrip({ stats }: { stats: Array<{ value: string; label: string }> }) {
  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <article key={stat.label} className="metric-card">
          <strong>{stat.value}</strong>
          <small>{stat.label}</small>
        </article>
      ))}
    </section>
  );
}