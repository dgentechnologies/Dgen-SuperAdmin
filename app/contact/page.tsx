import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';

const contactBlocks = [
  { title: 'Sales', description: 'Placeholder panel for quote requests, demos, and enterprise onboarding.' },
  { title: 'Support', description: 'Placeholder panel for implementation questions and operational support.' },
  { title: 'Partnerships', description: 'Placeholder panel for channel partners, alliances, and ecosystem outreach.' }
];

export default function ContactPage() {
  return (
    <MarketingShell
      eyebrow="Contact"
      title="Contact paths exist for every major visitor intent"
      description="Use this layout to capture enquiries later. For now, all fields and actions are represented as placeholders."
    >
      <section className="section split">
        <article className="panel">
          <h2>Placeholder Contact Form</h2>
          <p>This panel can later be replaced with a real form submission flow.</p>
          <div className="placeholder-form">
            <div className="placeholder-input">Full Name</div>
            <div className="placeholder-input">Work Email</div>
            <div className="placeholder-input">Company</div>
            <div className="placeholder-input placeholder-area">Project Brief</div>
            <button type="button" className="btn btn-solid">Send Placeholder Enquiry</button>
          </div>
        </article>
        <article>
          <PlaceholderCardGrid items={contactBlocks} />
        </article>
      </section>
    </MarketingShell>
  );
}