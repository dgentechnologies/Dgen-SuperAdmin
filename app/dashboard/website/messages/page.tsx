'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/site-shell';

type ApiResult<T> = { success: boolean; data?: T; error?: string };
type MessageState = 'unread' | 'read' | 'replied';
type Priority = 'high' | 'medium' | 'low';

interface WebsiteMessage {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  isRead?: boolean;
  replied?: boolean;
  priority?: string;
  createdAt?: unknown;
}

function resolveState(row: WebsiteMessage): MessageState {
  if (row.replied === true || row.status?.toLowerCase() === 'replied') return 'replied';
  if (row.isRead === true || row.status?.toLowerCase() === 'read') return 'read';
  return 'unread';
}

function resolvePriority(value: string | undefined): Priority {
  const normalized = value?.toLowerCase();
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') return normalized;
  return 'medium';
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

export default function WebsiteMessagesPage() {
  const [messages, setMessages] = useState<WebsiteMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | MessageState>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/website/messages', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load website messages');
        const body = (await response.json()) as ApiResult<WebsiteMessage[]>;
        if (!cancelled) {
          setMessages(body.success && body.data ? body.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load messages');
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
      const res = await fetch(`/api/website/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete message');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkRead = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/website/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true, status: 'read' }),
      });
      if (!res.ok) throw new Error('Failed to update message');
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true, status: 'read', replied: false } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return messages.filter((row) => {
      const state = resolveState(row);
      const matchesState = stateFilter === 'all' ? true : state === stateFilter;
      const haystack = `${row.name ?? ''} ${row.email ?? ''} ${row.subject ?? ''} ${row.message ?? ''}`.toLowerCase();
      const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;
      return matchesState && matchesQuery;
    });
  }, [messages, query, stateFilter]);

  const unreadCount = useMemo(() => messages.filter((row) => resolveState(row) === 'unread').length, [messages]);
  const repliedCount = useMemo(() => messages.filter((row) => resolveState(row) === 'replied').length, [messages]);
  const highPriorityCount = useMemo(
    () => messages.filter((row) => resolvePriority(row.priority) === 'high').length,
    [messages]
  );

  return (
    <DashboardShell
      title="Website Messages"
      description="Real-time contact inbox from Firestore with sender details, message states, and priority slicing."
    >
      <section className="stats-grid">
        <article className="metric-card">
          <span className="eyebrow">Unread</span>
          <strong>{loading ? '...' : unreadCount.toLocaleString('en-IN')}</strong>
          <small>Messages requiring first response</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Replied</span>
          <strong>{loading ? '...' : repliedCount.toLocaleString('en-IN')}</strong>
          <small>Closed communication loop</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">High Priority</span>
          <strong>{loading ? '...' : highPriorityCount.toLocaleString('en-IN')}</strong>
          <small>Escalation candidates</small>
        </article>
        <article className="metric-card">
          <span className="eyebrow">Visible</span>
          <strong>{loading ? '...' : filtered.length.toLocaleString('en-IN')}</strong>
          <small>Current filtered rows</small>
        </article>
      </section>

      <section className="dashboard-filters" style={{ marginTop: '1rem' }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sender, email, subject, or text"
          aria-label="Search messages"
        />
        <label>
          <span className="subtle">State</span>
          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value as 'all' | MessageState)}
            aria-label="Message state filter"
          >
            <option value="all">All states</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </label>
      </section>

      {error ? <div className="login-error">{error}</div> : null}

      <section className="panel" style={{ marginTop: error ? '1rem' : '0' }}>
        {loading ? (
          <p className="subtle">Loading messages...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No messages found</strong>
            <p>New contact submissions will appear here automatically.</p>
          </div>
        ) : (
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>State</th>
                  <th>Priority</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const state = resolveState(row);
                  const priority = resolvePriority(row.priority);

                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.name ?? 'Unknown sender'}</strong>
                        <p className="subtle">{row.email ?? 'No email provided'}</p>
                      </td>
                      <td>
                        <strong>{row.subject ?? 'No subject'}</strong>
                        <p className="subtle">{(row.message ?? '').slice(0, 100) || 'No message body'}</p>
                      </td>
                      <td>
                        <span className={`status-pill ${state === 'replied' ? 'status-ok' : state === 'read' ? 'status-warn' : 'status-error'}`}>
                          {state}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${priority === 'high' ? 'status-error' : priority === 'medium' ? 'status-warn' : 'status-ok'}`}>
                          {priority}
                        </span>
                      </td>
                      <td className="mono">{toDateLabel(row.createdAt)}</td>
                      <td>
                        <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {state === 'unread' && (
                            <button
                              className="btn-ghost"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              disabled={updatingId === row.id}
                              onClick={() => handleMarkRead(row.id)}
                            >
                              {updatingId === row.id ? '…' : 'Mark Read'}
                            </button>
                          )}
                          {confirmId === row.id ? (
                            <>
                              <button
                                className="btn-danger"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                disabled={deletingId === row.id}
                                onClick={() => handleDelete(row.id)}
                              >
                                {deletingId === row.id ? 'Deleting…' : 'Confirm'}
                              </button>
                              <button
                                className="btn-ghost"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => setConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-ghost"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--error)' }}
                              onClick={() => setConfirmId(row.id)}
                            >
                              Delete
                            </button>
                          )}
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