'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/site-shell';

type CareerStatus = 'open' | 'paused' | 'closed' | 'draft';

interface CreateForm {
  title: string;
  department: string;
  location: string;
  status: CareerStatus;
  type: string;
  workMode: string;
}

const EMPTY_FORM: CreateForm = {
  title: '',
  department: '',
  location: '',
  status: 'draft',
  type: '',
  workMode: '',
};

export default function CreateCareerPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/website/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          department: form.department.trim() || undefined,
          location: form.location.trim() || undefined,
          status: form.status,
          type: form.type || undefined,
          workMode: form.workMode || undefined,
        }),
      });
      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Failed to create listing');
      router.push('/dashboard/website/careers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Create Career Listing"
      description="Add a new job opening to the DGEN website careers section."
    >
      {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <section className="panel">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label style={{ gridColumn: '1 / -1' }}>
            <span className="subtle">Job Title *</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Frontend Engineer"
              required
            />
          </label>
          <label>
            <span className="subtle">Department</span>
            <input
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="e.g. Engineering"
            />
          </label>
          <label>
            <span className="subtle">Location</span>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Remote / Bengaluru"
            />
          </label>
          <label>
            <span className="subtle">Type</span>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="">Select type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </label>
          <label>
            <span className="subtle">Work Mode</span>
            <select value={form.workMode} onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))}>
              <option value="">Select mode</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <label>
            <span className="subtle">Initial Status</span>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CareerStatus }))}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="submit" className="btn btn-solid" disabled={saving}>
              {saving ? 'Creating…' : 'Create Listing'}
            </button>
            <button type="button" className="btn btn-soft" onClick={() => router.back()} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </DashboardShell>
  );
}
