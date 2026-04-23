'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type Range = 7 | 30 | 365;

interface TrendPoint { date: string; views: number; visitors: number }
interface TopCountry { country: string; views: number }
interface TopPage { page: string; views: number }
interface RecentVisitor { page: string; country: string; referrer: string; ts: unknown }

interface AnalyticsData {
  range: number;
  totalViews: number;
  totalVisitors: number;
  topCountries: TopCountry[];
  topPages: TopPage[];
  trend: TrendPoint[];
  recentVisitors: RecentVisitor[];
}

function toDateLabel(value: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('en-IN');
  }
  if (typeof value === 'object' && value !== null) {
    const v = value as { seconds?: number; _seconds?: number };
    const secs = v.seconds ?? v._seconds;
    if (typeof secs === 'number') return new Date(secs * 1000).toLocaleString('en-IN');
  }
  return '-';
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
      <div>
        <div className="mono" style={{ fontSize: '0.8rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.4s' }} />
        </div>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '3rem', textAlign: 'right' }}>{value.toLocaleString('en-IN')}</span>
    </div>
  );
}

function SparkLine({ trend }: { trend: TrendPoint[] }) {
  if (trend.length === 0) return <p className="subtle" style={{ fontSize: '0.8rem' }}>No trend data</p>;

  const maxViews = Math.max(...trend.map((t) => t.views), 1);
  const W = 100;
  const H = 40;
  const pts = trend.map((t, i) => {
    const x = (i / Math.max(trend.length - 1, 1)) * W;
    const y = H - (t.views / maxViews) * H;
    return `${x},${y}`;
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '64px', display: 'block' }}>
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>{trend[0]?.date}</span>
        <span>{trend[trend.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export default function WebsiteAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>(30);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/website/analytics?range=${range}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load analytics');
        const body = (await res.json()) as ApiResult<AnalyticsData>;
        if (!cancelled) {
          setData(body.success && body.data ? body.data : null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load analytics');
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [range]);

  const maxCountryViews = useMemo(() => Math.max(...(data?.topCountries.map((c) => c.views) ?? [0]), 1), [data]);
  const maxPageViews = useMemo(() => Math.max(...(data?.topPages.map((p) => p.views) ?? [0]), 1), [data]);

  return (
    <DashboardShell
      title="Website Analytics"
      description="Traffic analysis and audience insights from the live website. Data sourced from Firestore aggregates."
    >
      {/* Range selector */}
      <section style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {([7, 30, 365] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={range === r ? 'btn-primary' : 'btn-ghost'}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.9rem' }}
          >
            {r === 365 ? '1 Year' : `${r} Days`}
          </button>
        ))}
      </section>

      {/* KPI cards */}
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Total Views</span>
          <strong>{loading ? '...' : (data?.totalViews ?? 0).toLocaleString('en-IN')}</strong>
          <small>Page views in selected range</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Unique Visitors</span>
          <strong>{loading ? '...' : (data?.totalVisitors ?? 0).toLocaleString('en-IN')}</strong>
          <small>Distinct sessions tracked</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Top Country</span>
          <strong style={{ fontSize: '1rem' }}>{loading ? '...' : (data?.topCountries[0]?.country ?? '-')}</strong>
          <small>{loading ? '' : `${(data?.topCountries[0]?.views ?? 0).toLocaleString('en-IN')} views`}</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Top Page</span>
          <strong className="mono" style={{ fontSize: '0.85rem' }}>
            {loading ? '...' : (data?.topPages[0]?.page ?? '-')}
          </strong>
          <small>{loading ? '' : `${(data?.topPages[0]?.views ?? 0).toLocaleString('en-IN')} views`}</small>
        </article>
      </section>

      {error ? <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div> : null}

      {/* Trend chart */}
      <section className="panel" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Daily Views Trend</h2>
        {loading ? (
          <p className="subtle">Loading trend...</p>
        ) : (
          <SparkLine trend={data?.trend ?? []} />
        )}
      </section>

      {/* Top Countries + Top Pages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <section className="panel">
          <h2 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Top Countries</h2>
          {loading ? (
            <p className="subtle">Loading...</p>
          ) : !data?.topCountries.length ? (
            <p className="subtle">No country data</p>
          ) : (
            data.topCountries.map((c) => (
              <BarRow key={c.country} label={c.country} value={c.views} max={maxCountryViews} />
            ))
          )}
        </section>

        <section className="panel">
          <h2 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Top Pages</h2>
          {loading ? (
            <p className="subtle">Loading...</p>
          ) : !data?.topPages.length ? (
            <p className="subtle">No page data</p>
          ) : (
            data.topPages.map((p) => (
              <BarRow key={p.page} label={p.page} value={p.views} max={maxPageViews} />
            ))
          )}
        </section>
      </div>

      {/* Recent Visitors */}
      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Visitors</h2>
        {loading ? (
          <p className="subtle">Loading visitors...</p>
        ) : !data?.recentVisitors.length ? (
          <div className="empty-state">
            <strong>No recent visitor data</strong>
            <p>Raw pageView events have not been collected yet.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Country</th>
                  <th>Referrer</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisitors.map((v, i) => (
                  <tr key={i}>
                    <td className="mono">{v.page}</td>
                    <td>{v.country}</td>
                    <td className="subtle mono" style={{ fontSize: '0.75rem' }}>{v.referrer || '-'}</td>
                    <td className="mono">{toDateLabel(v.ts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
