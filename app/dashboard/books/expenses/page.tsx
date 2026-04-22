'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };

interface Expense {
  id: string;
  date?: string;
  createdAt?: string;
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
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function BooksExpensesPage() {
  const [month, setMonth] = useState(currentMonthValue());
  const [rows, setRows] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [expensesRes, summaryRes] = await Promise.all([
          fetch(`/api/books/expenses?month=${month}`, { cache: 'no-store' }),
          fetch(`/api/books/expenses/summary?month=${month}`, { cache: 'no-store' })
        ]);

        if (!expensesRes.ok || !summaryRes.ok) {
          throw new Error('Unable to load books data');
        }

        const expensesBody = (await expensesRes.json()) as ApiResult<Expense[]>;
        const summaryBody = (await summaryRes.json()) as ApiResult<Summary>;

        if (!cancelled) {
          setRows(expensesBody.success && expensesBody.data ? expensesBody.data : []);
          setSummary(summaryBody.success && summaryBody.data ? summaryBody.data : null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown books error');
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [month]);

  const totals = useMemo(() => {
    let credits = 0;
    let debits = 0;
    let pending = 0;

    for (const row of rows) {
      const amount = row.amount ?? 0;
      if ((row.type ?? 'debit') === 'credit') credits += amount;
      else debits += amount;
      if ((row.status ?? 'approved') === 'pending') pending += 1;
    }

    return {
      totalIn: credits,
      totalOut: debits,
      net: credits - debits,
      pending
    };
  }, [rows]);

  return (
    <DashboardShell
      title="Books Expenses"
      description="Monthly expenses overview with backend summaries, category analytics, and transaction-level visibility."
    >
      <section className="dashboard-filters">
        <label>
          <span className="subtle">Month</span>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Select month" />
        </label>
      </section>

      <section className="stats-grid" style={{ marginTop: '1rem' }}>
        <article className="metric-card">
          <span className="eyebrow">Total In</span>
          <strong>{loading ? '...' : `Rs ${Math.round(totals.totalIn).toLocaleString('en-IN')}`}</strong>
          <small>Credit entries</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Total Out</span>
          <strong>{loading ? '...' : `Rs ${Math.round(totals.totalOut).toLocaleString('en-IN')}`}</strong>
          <small>Debit entries</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Net Balance</span>
          <strong>{loading ? '...' : `Rs ${Math.round(totals.net).toLocaleString('en-IN')}`}</strong>
          <small>In minus out</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Pending</span>
          <strong>{loading ? '...' : totals.pending.toLocaleString('en-IN')}</strong>
          <small>Awaiting approval</small>
        </article>
      </section>

      {error ? <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div> : null}

      <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
        <article className="panel">
          <h2>Category Breakdown</h2>
          {loading ? (
            <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading summary...</p>
          ) : !summary || summary.byCategory.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '0.8rem' }}>
              <strong>No category summary</strong>
              <p>Add entries for this month to view category spend.</p>
            </div>
          ) : (
            <div className="stack" style={{ marginTop: '0.8rem' }}>
              {summary.byCategory.slice(0, 8).map((item) => (
                <div key={item.category} className="status-pill" style={{ justifyContent: 'space-between' }}>
                  <span>{item.category}</span>
                  <span className="mono">Rs {Math.round(item.amount).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="panel accent">
          <h2>Summary</h2>
          <p style={{ marginTop: '0.6rem' }}>
            Records: <strong>{loading ? '...' : (summary?.count ?? rows.length).toLocaleString('en-IN')}</strong>
          </p>
          <p style={{ marginTop: '0.45rem' }}>
            Total tracked spend: <strong>Rs {loading ? '...' : Math.round(summary?.total ?? 0).toLocaleString('en-IN')}</strong>
          </p>
          <p className="subtle" style={{ marginTop: '0.7rem' }}>
            Use month selector to compare cycles and identify irregular spend patterns.
          </p>
        </article>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>Expense Table</h2>
        {loading ? (
          <p className="subtle" style={{ marginTop: '0.6rem' }}>Loading transactions...</p>
        ) : rows.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '0.8rem' }}>
            <strong>No expenses in this month</strong>
            <p>Switch month or add records in Firestore to populate this table.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll" style={{ marginTop: '0.8rem' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const when = row.date ?? row.createdAt;
                  const status = row.status ?? 'approved';
                  return (
                    <tr key={row.id}>
                      <td className="mono">{when ? new Date(when).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{row.category ?? '-'}</td>
                      <td>{row.description ?? '-'}</td>
                      <td className="mono">Rs {Math.round(row.amount ?? 0).toLocaleString('en-IN')}</td>
                      <td>{row.type ?? 'debit'}</td>
                      <td>
                        <span
                          className={`status-pill ${status === 'approved' ? 'status-ok' : status === 'pending' ? 'status-warn' : 'status-error'}`}
                        >
                          {status}
                        </span>
                      </td>
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