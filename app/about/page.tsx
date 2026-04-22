import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';

const items = [
  { title: 'Who We Are', description: 'Placeholder story for company history, team positioning, and long-term direction.' },
  { title: 'What We Build', description: 'Placeholder explanation for the software, access, and operations stack.' },
  { title: 'Why It Matters', description: 'Placeholder section for customer outcomes, efficiency, and compliance goals.' }
];

export default function AboutPage() {
  return (
    <MarketingShell
      eyebrow="About"
      title="A complete placeholder company page ready for real content"
      description="This section gives you a working About page layout with stable navigation, content blocks, and call-to-action areas."
    >
      <section className="section">
        <PlaceholderCardGrid items={items} />
      </section>
    </MarketingShell>
  );
}