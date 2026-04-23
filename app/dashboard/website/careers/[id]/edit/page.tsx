'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PremiumSelect, type PremiumSelectOption } from '@/components/premium-select';
import { DashboardShell } from '@/components/site-shell';

type CareerStatus = 'open' | 'paused' | 'closed' | 'draft';
type Compensation = 'paid' | 'unpaid' | 'intern-paid' | '';

interface EditForm {
  title: string;
  category: string;
  topic: string;
  department: string;
  location: string;
  status: CareerStatus;
  type: string;
  workMode: string;
  compensation: Compensation;
  amount: string;
  amountSpan: string;
  duration: string;
  description: string;
  requirements: string;
  isActive: boolean;
}

const EMPTY_FORM: EditForm = {
  title: '',
  category: '',
  topic: '',
  department: '',
  location: '',
  status: 'draft',
  type: '',
  workMode: '',
  compensation: '',
  amount: '',
  amountSpan: '',
  duration: '',
  description: '',
  requirements: '',
  isActive: true,
};

const ROLE_TYPE_OPTIONS: PremiumSelectOption[] = [
  { value: '', label: 'Select type' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
];

const WORK_MODE_OPTIONS: PremiumSelectOption[] = [
  { value: '', label: 'Select mode' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
];

const COMPENSATION_OPTIONS: PremiumSelectOption[] = [
  { value: '', label: 'Select compensation' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'intern-paid', label: 'Intern Stipend' },
];

const CAREER_STATUS_OPTIONS: PremiumSelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
];

export default function EditCareerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* AI generate */
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBrief, setAiBrief] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/website/careers/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load career listing');
        const body = (await res.json()) as { success: boolean; data?: Record<string, unknown>; error?: string };
        if (!body.success || !body.data) throw new Error(body.error ?? 'Career not found');
        const d = body.data;
        setForm({
          title: String(d.title ?? d.role ?? ''),
          category: String(d.category ?? ''),
          topic: String(d.topic ?? ''),
          department: String(d.department ?? ''),
          location: String(d.location ?? ''),
          status: (d.status as CareerStatus) ?? 'draft',
          type: String(d.type ?? ''),
          workMode: String(d.workMode ?? ''),
          compensation: (d.compensation as Compensation) ?? '',
          amount: d.amount != null ? String(d.amount) : '',
          amountSpan: String(d.amountSpan ?? ''),
          duration: String(d.duration ?? ''),
          description: String(d.description ?? ''),
          requirements: String(d.requirements ?? ''),
          isActive: d.isActive !== false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load career');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleGenerate = async () => {
    if (!aiBrief.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/website/ai/generate-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: aiBrief }),
      });
      if (!res.ok) throw new Error('AI unavailable');
      const body = (await res.json()) as Partial<EditForm>;
      setForm((f) => ({
        ...f,
        title: body.title ?? f.title,
        category: body.category ?? f.category,
        topic: body.topic ?? f.topic,
        department: body.department ?? f.department,
        location: body.location ?? f.location,
        type: body.type ?? f.type,
        workMode: body.workMode ?? f.workMode,
        compensation: body.compensation ?? f.compensation,
        amount: body.amount ?? f.amount,
        amountSpan: body.amountSpan ?? f.amountSpan,
        duration: body.duration ?? f.duration,
        description: body.description ?? f.description,
        requirements: body.requirements ?? f.requirements,
      }));
      setAiOpen(false);
      setAiBrief('');
    } catch {
      setError('AI generation failed — update the fields manually.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/website/careers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim() || undefined,
          category: form.category.trim() || undefined,
          topic: form.topic.trim() || undefined,
          department: form.department.trim() || undefined,
          location: form.location.trim() || undefined,
          status: form.status,
          type: form.type || undefined,
          workMode: form.workMode || undefined,
          compensation: form.compensation || undefined,
          amount: form.amount ? Number(form.amount) : undefined,
          amountSpan: form.amountSpan.trim() || undefined,
          duration: form.duration.trim() || undefined,
          description: form.description.trim() || undefined,
          requirements: form.requirements.trim() || undefined,
          isActive: form.isActive,
        }),
      });
      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Failed to update listing');
      router.push('/dashboard/website/careers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
      setSaving(false);
    }
  };

  const showAmount = form.compensation === 'paid' || form.compensation === 'intern-paid';

  return (
    <DashboardShell
      title="Edit Career Listing"
      description="Update the details of an existing career listing on the DGEN website."
    >
      {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* AI Generate dialog */}
      {aiOpen && (
        <section className="panel accent" style={{ marginBottom: '1rem' }}>
          <h3 className="panel-title">✦ Generate with AI</h3>
          <p className="subtle" style={{ marginBottom: '0.75rem', fontSize: '0.82rem' }}>
            Describe the updated role briefly and the AI will regenerate the form fields.
          </p>
          <label>
            <span className="subtle">Brief description</span>
            <textarea
              rows={3}
              value={aiBrief}
              onChange={(e) => setAiBrief(e.target.value)}
              placeholder="e.g. A senior fullstack engineer for our IoT platform, onsite in Bengaluru, paid ₹60000/month"
              aria-label="AI brief input"
            />
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-solid"
              style={{ fontSize: '0.82rem' }}
              disabled={generating || !aiBrief.trim()}
              onClick={handleGenerate}
            >
              {generating ? 'Generating…' : '✦ Generate'}
            </button>
            <button
              type="button"
              className="btn btn-soft"
              style={{ fontSize: '0.82rem' }}
              onClick={() => { setAiOpen(false); setAiBrief(''); }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <p className="subtle">Loading career data…</p>
      ) : (
        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="panel-title" style={{ margin: 0 }}>Listing Details</h2>
            {!aiOpen && (
              <button
                type="button"
                className="btn btn-soft"
                style={{ fontSize: '0.8rem' }}
                onClick={() => setAiOpen(true)}
              >
                ✦ Generate with AI
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

            <label style={{ gridColumn: '1 / -1' }}>
              <span className="subtle">Position / Job Title *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Frontend Engineer Intern"
                required
              />
            </label>

            <label>
              <span className="subtle">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Engineering"
              />
            </label>
            <label>
              <span className="subtle">Topic / Specialisation</span>
              <input
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="e.g. React, IoT, Finance"
              />
            </label>

            <label>
              <span className="subtle">Department</span>
              <input
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Product"
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
              <PremiumSelect
                value={form.type}
                options={ROLE_TYPE_OPTIONS}
                onChange={(nextValue) => setForm((current) => ({ ...current, type: nextValue }))}
                placeholder="Select type"
                ariaLabel="Role type"
              />
            </label>
            <label>
              <span className="subtle">Work Mode</span>
              <PremiumSelect
                value={form.workMode}
                options={WORK_MODE_OPTIONS}
                onChange={(nextValue) => setForm((current) => ({ ...current, workMode: nextValue }))}
                placeholder="Select mode"
                ariaLabel="Work mode"
              />
            </label>

            <label>
              <span className="subtle">Compensation</span>
              <PremiumSelect
                value={form.compensation}
                options={COMPENSATION_OPTIONS}
                onChange={(nextValue) => setForm((current) => ({ ...current, compensation: nextValue as Compensation, amount: '', amountSpan: '' }))}
                placeholder="Select compensation"
                ariaLabel="Compensation"
              />
            </label>
            <label>
              <span className="subtle">Duration</span>
              <input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 3 months, permanent"
              />
            </label>

            {showAmount && (
              <>
                <label>
                  <span className="subtle">Amount (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 8000"
                  />
                </label>
                <label>
                  <span className="subtle">Amount Span</span>
                  <input
                    value={form.amountSpan}
                    onChange={(e) => setForm((f) => ({ ...f, amountSpan: e.target.value }))}
                    placeholder="e.g. per month"
                  />
                </label>
              </>
            )}

            <label style={{ gridColumn: '1 / -1' }}>
              <span className="subtle">Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, and what the candidate will work on…"
                aria-label="Job description"
              />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span className="subtle">Requirements</span>
              <textarea
                rows={4}
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                placeholder="List required skills, qualifications, and experience…"
                aria-label="Job requirements"
              />
            </label>

            <label>
              <span className="subtle">Status</span>
              <PremiumSelect
                value={form.status}
                options={CAREER_STATUS_OPTIONS}
                onChange={(nextValue) => setForm((current) => ({ ...current, status: nextValue as CareerStatus }))}
                ariaLabel="Status"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <span className="subtle">Visibility</span>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand)' }}
                />
                <span style={{ fontSize: '0.85rem', color: form.isActive ? 'var(--brand)' : 'var(--muted)' }}>
                  {form.isActive ? 'Active — visible on website' : 'Inactive — hidden from site'}
                </span>
              </label>
            </label>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button type="submit" className="btn btn-solid" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-soft" onClick={() => router.back()} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </DashboardShell>
  );
}
