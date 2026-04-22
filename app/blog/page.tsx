import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';
import { blogPosts } from '@/lib/placeholder-content';

export default function BlogPage() {
  return (
    <MarketingShell
      eyebrow="Blog"
      title="A working blog index layout is ready for real post data"
      description="These cards stand in for post previews, categories, and future CMS output without depending on backend routes yet."
    >
      <section className="section">
        <PlaceholderCardGrid items={blogPosts} />
      </section>
    </MarketingShell>
  );
}