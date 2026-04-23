'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Expense {
  id: string;
  date?: string;
  category?: string;
  description?: string;
  amount?: number;
  type?: 'credit' | 'debit';
  status?: 'approved' | 'pending' | 'rejected';
  addedBy?: string;
}

interface Summary {
  total: number;
  count: number;
  byCategory: Array<{ category: string; amount: number }>;
}

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function IcBook({ s = 20 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function IcDollar({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function IcTrend({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
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

const COLOR = '#38bdf8';
const COLOR_BG = 'rgba(56,189,248,0.12)';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function BooksOverviewPage() {
  const [month, setMonth]       = useState(currentMonthValue());
  const [rows, setRows]         = useState<Expense[]>([]);
  const [summary, setSummary]   = useState<Summary | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [er, sr] = await Promise.all([
          fetch(`/api/books/expenses?month=${month}`,         { cache: 'no-store' }),
          fetch(`/api/books/expenses/summary?month=${month}`, { cache: 'no-store' }),
        ]);
        const [eb, sb] = await Promise.all([
          er.ok ? (er.json() as Promise<ApiResult<Expense[]>>) : Promise.resolve({ success: false } as ApiResult<Expense[]>),
          sr.ok ? (sr.json() as Promise<ApiResult<Summary>>)   : Promise.resolve({ success: false } as ApiResult<Summary>),
        ]);
        if (!cancelled) {
          setRows(eb.success && eb.data ? eb.data : []);
          setSummary(sb.success && sb.data ? sb.data : null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load books data');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [month]);

  const totals = useMemo(() => {
    let credits = 0, debits = 0, pending = 0;
    for (const row of rows) {
      const amt = row.amount ?? 0;
      if ((row.type ?? 'debit') === 'credit') credits += amt;
      else debits += amt;
      if ((row.status ?? 'approved') === 'pending') pending += 1;
    }
    return { credits, debits, net: credits - debits, pending };
  }, [rows]);

  const n = (v: number) => loading ? '–' : v.toLocaleString('en-IN');
  const currency = (v: number) => loading ? '–' : INR.format(Math.round(v));

  const recentRows = useMemo(() => rows.slice(0, 6), [rows]);

  const NAV_CARDS = [
    {
      href: '/dashboard/books/expenses',
      icon: <IcDollar />,
      title: 'Expenses',
      desc: 'Monthly transaction log with category breakdown.',
      badge: rows.length > 0 ? `${n(rows.length)} entries` : null,
      badgeColor: '#38bdf8',
    },
    {
      href: '/dashboard/books/reports',
      icon: <IcTrend />,
      title: 'Reports',
      desc: 'Financial summaries, trends and analytics.',
      badge: summary ? currency(summary.total) : null,
      badgeColor: '#4ade80',
    },
  ];

  return (
    <DashboardShell
      title="Books"
      description="Module overview — expense tracking and financial reporting"
    >
      {/* Page header */}
      <div className="module-page-header">
        <div className="module-page-header-left">
          <div className="module-page-icon" style={{ background: COLOR_BG, color: COLOR }}>
            <IcBook s={22} />
          </div>
          <div>
            <h1 className="module-page-title" style={{ color: COLOR }}>Books</h1>
            <p className="module-page-subtitle">DGEN financial tracking — expenses and reports</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Month
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.42rem 0.7rem' }}
              aria-label="Select month"
            />
          </label>
        </div>
      </div>

      {error ? <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div> : null}

      {/* Stats */}
      <section className="stats-grid">
        <article className="metric-card metric-card-accent-books">
          <span className="eyebrow">Total Out</span>
          <strong style={{ color: COLOR, fontSize: '1rem' }}>{currency(totals.debits)}</strong>
          <small>Debits this month</small>
        </article>
        <article className="metric-card metric-card-accent-books">
          <span className="eyebrow">Total In</span>
          <strong style={{ color: '#4ade80', fontSize: '1rem' }}>{currency(totals.credits)}</strong>
          <small>Credits this month</small>
        </article>
        <article className="metric-card metric-card-accent-books">
          <span className="eyebrow">Net Balance</span>
          <strong style={{ color: totals.net >= 0 ? '#4ade80' : 'var(--danger)', fontSize: '1rem' }}>
            {currency(totals.net)}
          </strong>
          <small>In minus out</small>
        </article>
        <article className="metric-card" style={{ borderColor: totals.pending > 0 ? 'rgba(251,191,36,0.28)' : undefined }}>
          <span className="eyebrow">Transactions</span>
          <strong style={{ color: COLOR }}>{n(rows.length)}</strong>
          <small>{n(totals.pending)} pending approval</small>
        </article>
      </section>

      {/* Navigation cards */}
      <div className="overview-nav-grid" style={{ marginTop: '1.4rem' }}>
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="overview-nav-card"
            style={{ borderColor: 'rgba(56,189,248,0.18)' }}
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

      {/* Category breakdown + recent transactions side by side */}
      <div className="dashboard-grid" style={{ marginTop: '1.4rem' }}>
        {/* Category breakdown */}
        <div className="panel" style={{ borderColor: 'rgba(56,189,248,0.18)' }}>
          <h2 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem' }}>Category Spend</h2>
          {loading ? (
            <p className="subtle">Loading…</p>
          ) : !summary || summary.byCategory.length === 0 ? (
            <div className="empty-state">
              <strong>No data</strong>
              <p>Add expenses to see category breakdown.</p>
            </div>
          ) : (
            <div className="stack">
              {summary.byCategory.slice(0, 6).map((item) => {
                const pct = summary.total > 0 ? Math.round((item.amount / summary.total) * 100) : 0;
                return (
                  <div key={item.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.category}</span>
                      <span style={{ fontSize: '0.78rem', color: COLOR }}>{INR.format(Math.round(item.amount))}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '999px', background: COLOR, transition: 'width 600ms ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="panel" style={{ borderColor: 'rgba(56,189,248,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Recent Transactions</h2>
            <Link href="/dashboard/books/expenses" style={{ fontSize: '0.76rem', color: COLOR, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View all <IcArrow />
            </Link>
          </div>
          {loading ? (
            <p className="subtle">Loading…</p>
          ) : recentRows.length === 0 ? (
            <div className="empty-state">
              <strong>No transactions</strong>
              <p>Expense entries for this month will appear here.</p>
            </div>
          ) : (
            <div className="activity-feed">
              {recentRows.map((row) => {
                const isCredit = (row.type ?? 'debit') === 'credit';
                const isPending = (row.status ?? 'approved') === 'pending';
                return (
                  <div key={row.id} className="activity-item">
                    <div
                      className="activity-dot"
                      style={{ background: isPending ? 'var(--warning)' : isCredit ? '#4ade80' : 'var(--danger)' }}
                    />
                    <div className="activity-text">
                      <div className="activity-title">{row.description ?? row.category ?? 'Expense'}</div>
                      <div className="activity-meta">
                        {row.category ?? '—'}
                        {isPending ? <span style={{ color: 'var(--warning)', fontWeight: 600 }}> · pending</span> : null}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isCredit ? '#4ade80' : 'var(--danger)',
                      flexShrink: 0,
                    }}>
                      {isCredit ? '+' : '-'}{INR.format(Math.round(row.amount ?? 0))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
