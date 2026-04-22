'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type NavItem = {
  href: Route;
  label: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const dashboardGroups: NavGroup[] = [
  {
    title: 'Website',
    items: [
      { href: '/dashboard/website/posts', label: 'Posts' },
      { href: '/dashboard/website/messages', label: 'Messages' },
      { href: '/dashboard/website/careers', label: 'Careers' },
      { href: '/dashboard/website/applications', label: 'Applications' }
    ]
  },
  {
    title: 'Access',
    items: [
      { href: '/dashboard/access/employees', label: 'Employees' },
      { href: '/dashboard/access/logs', label: 'Logs' },
      { href: '/dashboard/access/settings', label: 'Settings' }
    ]
  },
  {
    title: 'Books',
    items: [
      { href: '/dashboard/books/expenses', label: 'Expenses' },
      { href: '/dashboard/books/reports', label: 'Reports' }
    ]
  }
];

export function DashboardShell({
  title,
  description,
  children,
  adminEmail,
  badges
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
  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date()),
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
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <img src="/logo.png" alt="DGEN logo" className="logo" />
          <div>
            <p className="brand-name">SuperAdmin</p>
            <p className="brand-sub">Dgen Technologies</p>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link
            href="/dashboard"
            className={`dashboard-link ${pathname === '/dashboard' ? 'dashboard-link-active' : 'dashboard-link-strong'}`}
          >
            Overview
          </Link>
          {dashboardGroups.map((group) => (
            <div key={group.title} className="dashboard-group">
              <p>{group.title}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`dashboard-link ${pathname.startsWith(item.href) ? 'dashboard-link-active' : ''}`}
                >
                  <span>{item.label}</span>
                  {badges?.[item.href] ? <span className="dashboard-badge">{badges[item.href]}</span> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="dashboard-aside-footer">
          <div className="dashboard-admin">
            <div>
              <strong>Signed in</strong>
              <small>{adminEmail ?? 'Authenticated SuperAdmin'}</small>
            </div>
            <span className="status-pill status-ok">Secure</span>
          </div>
          <button type="button" className="btn btn-soft full" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-frame">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            <div className="dashboard-header-meta">
              <span>{dateLabel}</span>
              <span className="status-pill status-ok">Live database views</span>
            </div>
          </header>
          <div className="dashboard-content">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function DashboardTable({
  title,
  columns,
  rows
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="panel dashboard-table-wrap">
      <div className="section-head compact">
        <p className="eyebrow">Placeholder Table</p>
        <h2>{title}</h2>
      </div>
      <div className="dashboard-table-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function StatsStrip({
  stats
}: {
  stats: Array<{ value: string; label: string }>;
}) {
  return (
    <section className="dashboard-stats">
      {stats.map((stat) => (
        <article key={stat.label} className="panel stat-panel">
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </article>
      ))}
    </section>
  );
}