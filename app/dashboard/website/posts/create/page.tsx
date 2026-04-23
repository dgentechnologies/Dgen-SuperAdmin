'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/site-shell';

/* ─── Types ─────────────────────────────────────────────────── */
interface Step1Form { author: string; topic: string; }
interface BlogForm {
  author: string;
  date: string;
  featuredImage: string;
  imageHint: string;
  tags: string;
  title: string;
  metaDescription: string;
  content: string;
}

const EMPTY_BLOG: BlogForm = {
  author: '',
  date: new Date().toISOString().split('T')[0],
  featuredImage: '',
  imageHint: '',
  tags: '',
  title: '',
  metaDescription: '',
  content: '',
};

/* ─── Toolbar button ─────────────────────────────────────────── */
function ToolBtn({
  label, title, onClick, active,
}: {
  label: string; title: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        padding: '0.22rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid var(--line)',
        borderRadius: '6px',
        background: active ? 'var(--brand-soft)' : 'transparent',
        color: active ? 'var(--brand)' : 'var(--muted-strong)',
        cursor: 'pointer',
        lineHeight: 1.3,
        fontFamily: 'inherit',
        transition: 'background 120ms, color 120ms',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function CreatePostPage() {
  const router = useRouter();

  /* Step 1 state */
  const [step, setStep] = useState<1 | 2>(1);
  const [s1, setS1] = useState<Step1Form>({ author: '', topic: '' });
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  /* Step 2 state */
  const [form, setForm] = useState<BlogForm>(EMPTY_BLOG);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);

  /* Sync contenteditable → form.content */
  const syncContent = useCallback(() => {
    if (editorRef.current) {
      setForm((f) => ({ ...f, content: editorRef.current!.innerHTML }));
    }
  }, []);

  /* Set initial content when entering step 2 */
  useEffect(() => {
    if (step === 2 && editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = form.content;
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── AI: Suggest Topics ── */
  const handleSuggestTopics = async () => {
    if (!s1.author.trim()) { setSuggestError('Enter an author name first.'); return; }
    setSuggesting(true);
    setSuggestError(null);
    try {
      const res = await fetch('/api/website/ai/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: s1.author }),
      });
      if (!res.ok) throw new Error('AI service unavailable');
      const body = (await res.json()) as { topics?: string[] };
      setSuggestedTopics(body.topics ?? []);
    } catch {
      /* Fallback: show placeholder chips so the UI flow is demonstrable */
      setSuggestedTopics([
        `How DGEN is shaping the future of smart access`,
        `Behind the build: internship life at DGEN Technologies`,
        `Green IoT: building sustainable tech for Indian enterprises`,
      ]);
    } finally {
      setSuggesting(false);
    }
  };

  /* ── Step 1 → Step 2 ── */
  const proceedToEditor = () => {
    if (!s1.author.trim() || !s1.topic.trim()) return;
    setForm((f) => ({ ...f, author: s1.author }));
    setStep(2);
  };

  /* ── Toolbar helpers ── */
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    syncContent();
    editorRef.current?.focus();
  };

  const insertHtml = (html: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
    syncContent();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const src = prompt('Enter image URL:');
    if (src) insertHtml(`<img src="${src}" alt="image" style="max-width:100%;border-radius:8px;margin:0.5rem 0;" />`);
  };

  /* ── AI: Generate Post ── */
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/website/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: form.author, topic: s1.topic }),
      });
      if (!res.ok) throw new Error('AI generation unavailable');
      const body = (await res.json()) as {
        title?: string; description?: string; tags?: string;
        content?: string; image?: string; imageHint?: string;
      };
      setForm((f) => ({
        ...f,
        title: body.title ?? f.title,
        metaDescription: body.description ?? f.metaDescription,
        tags: body.tags ?? f.tags,
        featuredImage: body.image ?? f.featuredImage,
        imageHint: body.imageHint ?? f.imageHint,
        content: body.content ?? f.content,
      }));
      if (editorRef.current && body.content) {
        editorRef.current.innerHTML = body.content;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Publish ── */
  const handlePublish = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required before publishing.');
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch('/api/website/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content,
          authorName: form.author,
          metaDescription: form.metaDescription,
          featuredImage: form.featuredImage || undefined,
          imageHint: form.imageHint || undefined,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          publishDate: form.date || undefined,
          status: 'published',
        }),
      });
      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Failed to publish');
      router.push('/dashboard/website/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
      setPublishing(false);
    }
  };

  /* ─── RENDER ─────────────────────────────────────────────── */
  return (
    <DashboardShell
      title={step === 1 ? 'New Blog Post' : 'Blog Editor'}
      description={
        step === 1
          ? 'Choose a topic and author to begin. Use AI to get topic ideas.'
          : 'Compose, format, and publish your post with live preview.'
      }
    >
      {/* ── STEP 1: Topic Selection ── */}
      {step === 1 && (
        <section className="panel" style={{ maxWidth: '560px' }}>
          <h2 className="panel-title">Step 1 — Author &amp; Topic</h2>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <label>
              <span className="subtle">Author *</span>
              <input
                value={s1.author}
                onChange={(e) => setS1((p) => ({ ...p, author: e.target.value }))}
                placeholder="e.g. Arjun Mehta"
                required
              />
            </label>

            <label>
              <span className="subtle">Topic *</span>
              <input
                value={s1.topic}
                onChange={(e) => setS1((p) => ({ ...p, topic: e.target.value }))}
                placeholder="e.g. Smart access control for SMEs"
              />
            </label>

            {/* Suggest Topics row */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-soft"
                style={{ fontSize: '0.8rem' }}
                disabled={suggesting}
                onClick={handleSuggestTopics}
              >
                {suggesting ? 'Thinking…' : '✦ Suggest Topics'}
              </button>
              {suggestError && <span className="subtle" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{suggestError}</span>}
            </div>

            {/* Topic chips */}
            {suggestedTopics.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="btn btn-soft"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.3rem 0.7rem',
                      borderColor: s1.topic === topic ? 'var(--brand)' : undefined,
                      color: s1.topic === topic ? 'var(--brand)' : undefined,
                    }}
                    onClick={() => setS1((p) => ({ ...p, topic }))}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-solid"
              disabled={!s1.author.trim() || !s1.topic.trim()}
              onClick={proceedToEditor}
            >
              Continue to Editor →
            </button>
            <button type="button" className="btn btn-soft" onClick={() => router.push('/dashboard/website/posts')}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 2: Blog Editor ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="login-error">{error}</div>}

          {/* Top action bar */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-soft" style={{ fontSize: '0.8rem' }} onClick={() => setStep(1)}>
              ← Back
            </button>
            <span className="subtle" style={{ flex: 1, minWidth: '120px' }}>
              Topic: <strong style={{ color: 'var(--ink)' }}>{s1.topic}</strong>
            </span>
            <button
              type="button"
              className="btn btn-soft"
              style={{ fontSize: '0.8rem' }}
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? 'Generating…' : '✦ Generate with AI'}
            </button>
            <button
              type="button"
              className="btn btn-solid"
              style={{ fontSize: '0.8rem' }}
              disabled={publishing}
              onClick={handlePublish}
            >
              {publishing ? 'Publishing…' : '↑ Publish'}
            </button>
            <button
              type="button"
              className="btn btn-soft"
              style={{ fontSize: '0.8rem' }}
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Two-column layout: editor (left) + preview (right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr',
              gap: '1rem',
              alignItems: 'start',
            }}
          >
            {/* ── Editor Panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Metadata fields */}
              <section className="panel" style={{ padding: '1rem' }}>
                <h3 className="panel-title" style={{ marginBottom: '0.75rem' }}>Post Metadata</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <label>
                    <span className="subtle">Author *</span>
                    <input
                      value={form.author}
                      onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                      placeholder="Author name"
                      required
                    />
                  </label>
                  <label>
                    <span className="subtle">Publish Date</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    />
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span className="subtle">Title *</span>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Post title"
                      required
                    />
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span className="subtle">Meta Description</span>
                    <input
                      value={form.metaDescription}
                      onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                      placeholder="SEO description (160 chars)"
                      maxLength={160}
                    />
                  </label>
                  <label>
                    <span className="subtle">Featured Image URL</span>
                    <input
                      value={form.featuredImage}
                      onChange={(e) => setForm((f) => ({ ...f, featuredImage: e.target.value }))}
                      placeholder="https://..."
                    />
                  </label>
                  <label>
                    <span className="subtle">Image Hint</span>
                    <input
                      value={form.imageHint}
                      onChange={(e) => setForm((f) => ({ ...f, imageHint: e.target.value }))}
                      placeholder="e.g. smart city IoT"
                    />
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span className="subtle">Tags (comma-separated)</span>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                      placeholder="tech, innovation, dgen"
                    />
                  </label>
                </div>
              </section>

              {/* Content editor */}
              <section className="panel" style={{ padding: '1rem' }}>
                <h3 className="panel-title" style={{ marginBottom: '0.6rem' }}>Content</h3>

                {/* Toolbar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.3rem',
                    paddingBottom: '0.6rem',
                    borderBottom: '1px solid var(--line)',
                    marginBottom: '0.6rem',
                  }}
                >
                  <ToolBtn label="B" title="Bold" onClick={() => exec('bold')} />
                  <ToolBtn label="I" title="Italic" onClick={() => exec('italic')} />
                  <ToolBtn label="U" title="Underline" onClick={() => exec('underline')} />
                  <span style={{ width: '1px', background: 'var(--line)', margin: '0 0.1rem' }} />
                  <ToolBtn label="H1" title="Heading 1" onClick={() => exec('formatBlock', '<h1>')} />
                  <ToolBtn label="H2" title="Heading 2" onClick={() => exec('formatBlock', '<h2>')} />
                  <ToolBtn label="H3" title="Heading 3" onClick={() => exec('formatBlock', '<h3>')} />
                  <ToolBtn label="¶" title="Paragraph" onClick={() => exec('formatBlock', '<p>')} />
                  <span style={{ width: '1px', background: 'var(--line)', margin: '0 0.1rem' }} />
                  <ToolBtn label="≡L" title="Align Left" onClick={() => exec('justifyLeft')} />
                  <ToolBtn label="≡C" title="Align Center" onClick={() => exec('justifyCenter')} />
                  <ToolBtn label="≡R" title="Align Right" onClick={() => exec('justifyRight')} />
                  <span style={{ width: '1px', background: 'var(--line)', margin: '0 0.1rem' }} />
                  <ToolBtn label="• List" title="Bullet List" onClick={() => exec('insertUnorderedList')} />
                  <ToolBtn label="1. List" title="Ordered List" onClick={() => exec('insertOrderedList')} />
                  <ToolBtn label="❝" title="Blockquote" onClick={() => exec('formatBlock', '<blockquote>')} />
                  <span style={{ width: '1px', background: 'var(--line)', margin: '0 0.1rem' }} />
                  <ToolBtn label="🔗" title="Insert Link" onClick={insertLink} />
                  <ToolBtn label="🖼" title="Insert Image" onClick={insertImage} />
                </div>

                {/* Contenteditable editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncContent}
                  onBlur={syncContent}
                  aria-label="Blog content editor"
                  style={{
                    minHeight: '320px',
                    padding: '0.75rem',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    outline: 'none',
                    lineHeight: 1.7,
                    fontSize: '0.9rem',
                    color: 'var(--ink)',
                    overflowY: 'auto',
                    maxHeight: '520px',
                  }}
                />

                {/* Raw HTML toggle */}
                <details style={{ marginTop: '0.5rem' }}>
                  <summary className="subtle" style={{ cursor: 'pointer', fontSize: '0.78rem', userSelect: 'none' }}>
                    Raw HTML
                  </summary>
                  <textarea
                    value={form.content}
                    onChange={(e) => {
                      const html = e.target.value;
                      setForm((f) => ({ ...f, content: html }));
                      if (editorRef.current) editorRef.current.innerHTML = html;
                    }}
                    rows={8}
                    style={{
                      marginTop: '0.4rem',
                      width: '100%',
                      padding: '0.6rem',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.18)',
                      color: 'var(--muted-strong)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.78rem',
                      resize: 'vertical',
                    }}
                    aria-label="Raw HTML content"
                  />
                </details>
              </section>
            </div>

            {/* ── Preview Panel ── */}
            {showPreview && (
              <section
                className="panel"
                style={{
                  padding: '1.25rem',
                  position: 'sticky',
                  top: '1rem',
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto',
                }}
              >
                <h3 className="panel-title">Live Preview</h3>
                {form.featuredImage && (
                  <img
                    src={form.featuredImage}
                    alt={form.imageHint || 'Featured image'}
                    style={{ width: '100%', borderRadius: '8px', marginBottom: '0.75rem', maxHeight: '180px', objectFit: 'cover' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {form.title ? (
                  <h1
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      marginBottom: '0.3rem',
                      lineHeight: 1.3,
                      color: 'var(--ink)',
                    }}
                  >
                    {form.title}
                  </h1>
                ) : (
                  <p className="subtle" style={{ marginBottom: '0.3rem', fontStyle: 'italic' }}>No title yet</p>
                )}
                {(form.author || form.date) && (
                  <p className="subtle mono" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                    {form.author}{form.author && form.date ? ' · ' : ''}{form.date}
                  </p>
                )}
                {form.metaDescription && (
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--muted-strong)',
                      marginBottom: '0.75rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {form.metaDescription}
                  </p>
                )}
                {form.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '999px',
                          border: '1px solid var(--line-strong)',
                          color: 'var(--muted-strong)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--ink)' }}
                  // Safe: content is composed by the admin in this session
                  dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:var(--muted)"><em>Start typing to see preview…</em></p>' }}
                />
              </section>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
