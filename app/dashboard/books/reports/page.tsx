'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Summary {
  total: number;
  count: number;
  byCategory: Array<{ category: string; amount: number }>;
}

interface Expense {
  id: string;
  amount?: number;
  type?: 'credit' | 'debit';
  status?: 'approved' | 'pending' | 'rejected';
  category?: string;
}

function currentMonthValue(offset = 0) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function BooksReportsPage() {
  const [month, setMonth] = useState(currentMonthValue());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const previousMonth = currentMonthValue(-1);
        const [summaryRes, previousRes, expensesRes] = await Promise.all([
          fetch(`/api/books/expenses/summary?month=${month}`, { cache: 'no-store' }),
          fetch(`/api/books/expenses/summary?month=${previousMonth}`, { cache: 'no-store' }),
          fetch(`/api/books/expenses?month=${month}`, { cache: 'no-store' })
        ]);

        if (!summaryRes.ok || !previousRes.ok || !expensesRes.ok) {
          throw new Error('Unable to load report data');
        }

        const [summaryBody, previousBody, expensesBody] = (await Promise.all([
          summaryRes.json(),
          previousRes.json(),
          expensesRes.json()
        ])) as [ApiResult<Summary>, ApiResult<Summary>, ApiResult<Expense[]>];

        if (!cancelled) {
          setSummary(summaryBody.success && summaryBody.data ? summaryBody.data : null);
          setPreviousSummary(previousBody.success && previousBody.data ? previousBody.data : null);
          setExpenses(expensesBody.success && expensesBody.data ? expensesBody.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate reports');
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [month]);

  const derived = useMemo(() => {
    let credits = 0;
    let debits = 0;
    let pending = 0;

    for (const row of expenses) {
      const amount = row.amount ?? 0;
      if ((row.type ?? 'debit') === 'credit') credits += amount;
      else debits += amount;
      if ((row.status ?? 'approved') === 'pending') pending += 1;
    }

    return {
      credits,
      debits,
      net: credits - debits,
      pending
    };
  }, [expenses]);

  const monthDelta = useMemo(() => {
    const current = summary?.total ?? 0;
    const previous = previousSummary?.total ?? 0;
    return current - previous;
  }, [summary, previousSummary]);

  return (
    <DashboardShell
      title="Reports"
      description="Dynamic books reports from Firestore transactions, category distribution, and month-over-month changes."
    >
      <section className="dashboard-filters">
        <label>
          <span className="subtle">Report month</span>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Report month" />
        </label>
      </section>

      <section className="stats-grid" style={{ marginTop: '1rem' }}>
        <article className="metric-card">
          <span className="eyebrow">Total Spend</span>
          <strong>{loading ? '...' : `Rs ${Math.round(summary?.total ?? 0).toLocaleString('en-IN')}`}</strong>
          <small>From monthly summary endpoint</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Net Flow</span>
          <strong>{loading ? '...' : `Rs ${Math.round(derived.net).toLocaleString('en-IN')}`}</strong>
          <small>Credits minus debits</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">MoM Change</span>
          <strong>{loading ? '...' : `Rs ${Math.round(monthDelta).toLocaleString('en-IN')}`}</strong>
          <small>Compared with previous month</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Pending Entries</span>
          <strong>{loading ? '...' : derived.pending.toLocaleString('en-IN')}</strong>
          <small>Awaiting approval</small>
        </article>
      </section>

      {error ? <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div> : null}

      <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
        <article className="panel">
          <h2>Category Spend</h2>
          {loading ? (
            <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading category analytics...</p>
          ) : !summary || summary.byCategory.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '0.8rem' }}>
              <strong>No category data</strong>
              <p>No expenses were recorded for this month.</p>
            </div>
          ) : (
            <div className="stack" style={{ marginTop: '0.8rem' }}>
              {summary.byCategory
                .slice()
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 8)
                .map((item) => (
                  <div key={item.category} className="status-pill" style={{ justifyContent: 'space-between' }}>
                    <span>{item.category}</span>
                    <span className="mono">Rs {Math.round(item.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
            </div>
          )}
        </article>

        <article className="panel accent">
          <h2>Report Summary</h2>
          <p style={{ marginTop: '0.6rem' }}>
            Transactions: <strong>{loading ? '...' : (summary?.count ?? expenses.length).toLocaleString('en-IN')}</strong>
          </p>
          <p style={{ marginTop: '0.45rem' }}>
            Credit total: <strong>{loading ? '...' : `Rs ${Math.round(derived.credits).toLocaleString('en-IN')}`}</strong>
          </p>
          <p style={{ marginTop: '0.45rem' }}>
            Debit total: <strong>{loading ? '...' : `Rs ${Math.round(derived.debits).toLocaleString('en-IN')}`}</strong>
          </p>
          <p className="subtle" style={{ marginTop: '0.75rem' }}>
            Use this monthly report to validate spend concentration and detect anomalies before financial close.
          </p>
        </article>
      </section>
    </DashboardShell>
  );
}