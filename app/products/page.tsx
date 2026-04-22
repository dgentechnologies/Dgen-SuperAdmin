import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';
import { products } from '@/lib/placeholder-content';

export default function ProductsPage() {
  return (
    <MarketingShell
      eyebrow="Products"
      title="Each product area has a dedicated placeholder presentation"
      description="This page maps the DGEN platform modules so users can browse the full product structure before backend integration."
    >
      <section className="section">
        <PlaceholderCardGrid items={products} />
      </section>
    </MarketingShell>
  );
}