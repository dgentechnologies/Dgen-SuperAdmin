'use client';

import { DashboardShell } from '@/components/site-shell';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();

  return (
    <DashboardShell
      title="Write New Post"
      description="Create and publish a new blog post to the DGEN Technologies website."
    >
      <section className="panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1 }}>✍️</p>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Blog Editor — Coming Soon
        </h2>
        <p className="subtle" style={{ maxWidth: '440px', margin: '0 auto 1.75rem' }}>
          The two-step blog creation flow — topic selection, AI-assisted drafting, full HTML editor, image upload,
          slug generation and collision check — is being built and will be available soon.
        </p>
        <button className="btn btn-soft" onClick={() => router.push('/dashboard/website/posts')}>
          ← Back to Blog List
        </button>
      </section>
    </DashboardShell>
  );
}
