import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';
import { pricingPlans } from '@/lib/placeholder-content';

export default function PricingPage() {
  return (
    <MarketingShell
      eyebrow="Pricing"
      title="Pricing tiers are laid out with placeholder CTAs"
      description="This gives you a navigable pricing page now, with enough structure to connect billing or lead capture later."
    >
      <section className="section">
        <PlaceholderCardGrid items={pricingPlans} />
      </section>
    </MarketingShell>
  );
}