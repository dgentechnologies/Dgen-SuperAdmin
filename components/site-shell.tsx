import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';

type NavItem = {
  href: Route;
  label: string;
};

const marketingNav: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' }
];

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

export function MarketingShell({
  title,
  eyebrow,
  description,
  children
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="landing">
      <header className="topbar">
        <div className="brand-wrap">
          <img src="/logo.svg" alt="DGEN logo" className="logo" />
          <div>
            <p className="brand-name">DGEN Technologies</p>
            <p className="brand-sub">Unified placeholder website</p>
          </div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="top-actions">
          <Link href="/login" className="btn btn-soft">
            Login
          </Link>
          <Link href="/dashboard" className="btn btn-solid">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="page-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      {children}

      <footer className="footer">
        <p>© 2026 DGEN Technologies Pvt. Ltd.</p>
        <p>Placeholder content only. Backend wiring can be added later.</p>
      </footer>
    </main>
  );
}

export function DashboardShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <img src="/logo.svg" alt="DGEN logo" className="logo" />
          <div>
            <p className="brand-name">SuperAdmin</p>
            <p className="brand-sub">Placeholder mode</p>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link href="/dashboard" className="dashboard-link dashboard-link-strong">
            Overview
          </Link>
          {dashboardGroups.map((group) => (
            <div key={group.title} className="dashboard-group">
              <p>{group.title}</p>
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className="dashboard-link">
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="dashboard-actions">
            <Link href="/" className="btn btn-soft">
              Open Website
            </Link>
            <Link href="/login" className="btn btn-solid">
              Auth Placeholder
            </Link>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

export function PlaceholderCardGrid({
  items
}: {
  items: Array<{ title: string; description: string }>;
}) {
  return (
    <div className="grid-3">
      {items.map((item) => (
        <article key={item.title} className="panel reveal">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <button type="button" className="text-link">
            Placeholder action
          </button>
        </article>
      ))}
    </div>
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