'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived' | 'unknown';

interface WebsitePost {
  id: string;
  title?: string;
  slug?: string;
  status?: string;
  authorName?: string;
  author?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function resolveStatus(value: string | undefined): PostStatus {
  if (!value) return 'unknown';
  const normalized = value.toLowerCase();
  if (normalized === 'draft' || normalized === 'published' || normalized === 'scheduled' || normalized === 'archived') {
    return normalized;
  }
  return 'unknown';
}

function toDateLabel(value: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN');
  }

  if (typeof value === 'object' && value !== null) {
    const withSeconds = value as { seconds?: number; _seconds?: number };
    const rawSeconds = withSeconds.seconds ?? withSeconds._seconds;
    if (typeof rawSeconds === 'number') {
      return new Date(rawSeconds * 1000).toLocaleString('en-IN');
    }
  }

  return '-';
}

export default function WebsitePostsPage() {
  const [posts, setPosts] = useState<WebsitePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | PostStatus>('all');
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/website/posts', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load website posts');
        const body = (await response.json()) as ApiResult<WebsitePost[]>;
        if (!cancelled) {
          setPosts(body.success && body.data ? body.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load posts');
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/website/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    return posts.filter((row) => {
      const rowStatus = resolveStatus(row.status);
      const matchesStatus = status === 'all' ? true : rowStatus === status;
      const haystack = `${row.title ?? ''} ${row.slug ?? ''} ${row.authorName ?? row.author ?? ''}`.toLowerCase();
      const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;
      return matchesStatus && matchesQuery;
    });
  }, [posts, query, status]);

  const counts = useMemo(() => {
    return posts.reduce(
      (acc, row) => {
        const current = resolveStatus(row.status);
        if (current === 'draft') acc.draft += 1;
        if (current === 'published') acc.published += 1;
        if (current === 'scheduled') acc.scheduled += 1;
        return acc;
      },
      { draft: 0, published: 0, scheduled: 0 }
    );
  }, [posts]);

  return (
    <DashboardShell
      title="Website Posts"
      description="Live content inventory from Firestore with status breakdown and publish-readiness visibility."
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Draft</span>
          <strong>{loading ? '...' : counts.draft.toLocaleString('en-IN')}</strong>
          <small>Draft posts pending release</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Published</span>
          <strong>{loading ? '...' : counts.published.toLocaleString('en-IN')}</strong>
          <small>Posts currently live</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Scheduled</span>
          <strong>{loading ? '...' : counts.scheduled.toLocaleString('en-IN')}</strong>
          <small>Queued content</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Visible Rows</span>
          <strong>{loading ? '...' : filtered.length.toLocaleString('en-IN')}</strong>
          <small>After active filters</small>
        </article>
      </section>

      <section style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div className="dashboard-filters" style={{ flex: 1, marginTop: 0 }}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, slug, or author"
            aria-label="Search posts"
          />
          <label>
            <span className="subtle">Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | PostStatus)} aria-label="Status filter">
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
        </div>
        <button
          className="btn btn-solid"
          style={{ fontSize: '0.8rem' }}
          onClick={() => router.push('/dashboard/website/posts/create')}
        >
          + Write New Post
        </button>
      </section>

      {error ? <div className="login-error">{error}</div> : null}

      <section className="panel" style={{ marginTop: error ? '1rem' : '0' }}>
        {loading ? (
          <p className="subtle">Loading posts...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No posts found</strong>
            <p>Try changing filters or publish new content to populate this view.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Updated</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const rowStatus = resolveStatus(row.status);
                  const statusClass =
                    rowStatus === 'published' ? 'status-ok' : rowStatus === 'draft' ? 'status-warn' : 'status-error';

                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.title ?? 'Untitled post'}</strong>
                        <p className="subtle mono">/{row.slug ?? row.id}</p>
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>{rowStatus}</span>
                      </td>
                      <td>{row.authorName ?? row.author ?? 'Unknown author'}</td>
                      <td className="mono">{toDateLabel(row.updatedAt)}</td>
                      <td className="mono">{toDateLabel(row.createdAt)}</td>
                      <td>
                        {confirmId === row.id ? (
                          <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-danger"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              disabled={deletingId === row.id}
                              onClick={() => handleDelete(row.id)}
                            >
                              {deletingId === row.id ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              className="btn btn-soft"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              onClick={() => setConfirmId(null)}
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            className="btn btn-soft"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--danger)' }}
                            onClick={() => setConfirmId(row.id)}
                          >
                            Delete
                          </button>
                        )}
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