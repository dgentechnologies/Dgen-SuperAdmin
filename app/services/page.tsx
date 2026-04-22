import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';
import { serviceCards } from '@/lib/placeholder-content';

export default function ServicesPage() {
  return (
    <MarketingShell
      eyebrow="Services"
      title="Service blocks are in place for every major offer"
      description="Use these cards as placeholders until service descriptions, pricing logic, and enquiry actions are connected."
    >
      <section className="section">
        <PlaceholderCardGrid items={serviceCards} />
      </section>
    </MarketingShell>
  );
}