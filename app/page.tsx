import Link from 'next/link';
import { MarketingShell, PlaceholderCardGrid } from '@/components/site-shell';
import { pricingPlans, products, serviceCards } from '@/lib/placeholder-content';

export default function HomePage() {
  return (
    <MarketingShell
      eyebrow="Placeholder Landing Page"
      title="One platform, every operation, fully visible."
      description="This is a complete placeholder website layout with connected navigation, multiple inner pages, and a browsable dashboard shell."
    >
      <section className="hero" id="home">
        <div className="hero-actions">
          <button type="button" className="btn btn-solid">
            Start Free Trial (Placeholder)
          </button>
          <button type="button" className="btn btn-soft">
            Book Demo (Placeholder)
          </button>
        </div>
        <div className="hero-stats">
          <article>
            <h3>120+</h3>
            <p>Enterprise workflows</p>
          </article>
          <article>
            <h3>99.9%</h3>
            <p>Platform uptime</p>
          </article>
          <article>
            <h3>4 Projects</h3>
            <p>Unified in one admin view</p>
          </article>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-head">
          <p className="eyebrow">Services</p>
          <h2>Everything you need to launch and scale</h2>
        </div>
        <PlaceholderCardGrid items={serviceCards} />
      </section>

      <section className="section split" id="products">
        <article className="panel">
          <p className="eyebrow">Platform Modules</p>
          <h2>Built as independent blocks, managed in one place</h2>
          <ul className="module-list">
            {products.map((item) => (
              <li key={item.title}>{item.title} (Placeholder)</li>
            ))}
          </ul>
        </article>
        <article className="panel accent">
          <h3>Live Preview Card</h3>
          <p>
            Placeholder widgets, alerts, and data tiles can be connected to Firebase APIs later
            without redesigning this layout.
          </p>
          <div className="mini-grid">
            <div>
              <span>Messages</span>
              <strong>--</strong>
            </div>
            <div>
              <span>Applications</span>
              <strong>--</strong>
            </div>
            <div>
              <span>Unlock Actions</span>
              <strong>--</strong>
            </div>
            <div>
              <span>Expenses</span>
              <strong>--</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="section" id="pricing">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h2>Simple plans for placeholders today, production tomorrow</h2>
        </div>
        <PlaceholderCardGrid items={pricingPlans} />
      </section>

      <section className="section" id="faq">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>Common placeholder questions</h2>
        </div>
        <div className="faq-list">
          <details>
            <summary>Is backend connected right now?</summary>
            <p>No, all actions and values are placeholders for now.</p>
          </details>
          <details>
            <summary>Can this be linked to APIs later?</summary>
            <p>Yes, this structure is ready for API and Firebase integration.</p>
          </details>
          <details>
            <summary>Is this page responsive?</summary>
            <p>Yes, it adapts for desktop, tablet, and mobile screens.</p>
          </details>
        </div>
      </section>

      <section className="section cta" id="contact">
        <h2>Ready to connect this UI to production data?</h2>
        <p>Use the existing API routes to wire each placeholder card when you are ready.</p>
        <Link href="/contact" className="btn btn-solid">
          Contact Sales (Placeholder)
        </Link>
      </section>
    </MarketingShell>
  );
}
