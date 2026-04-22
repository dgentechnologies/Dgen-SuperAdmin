const navItems = [
  'Home',
  'About',
  'Services',
  'Products',
  'Pricing',
  'Blog',
  'FAQ',
  'Contact'
];

const serviceCards = [
  {
    title: 'Strategy & Consulting',
    description: 'Placeholder block for business strategy, workshops, and transformation planning.'
  },
  {
    title: 'Product Engineering',
    description: 'Placeholder block for full-cycle design, development, and deployment services.'
  },
  {
    title: 'Cloud & DevOps',
    description: 'Placeholder block for infrastructure, CI/CD pipelines, and release automation.'
  },
  {
    title: 'AI Automation',
    description: 'Placeholder block for AI copilots, workflow automation, and data assistants.'
  }
];

const modules = [
  'Website Management',
  'Access Control',
  'Finance Operations',
  'Audit & Reporting'
];

const pricingPlans = [
  { name: 'Starter', price: '$29', detail: 'For small teams and pilots' },
  { name: 'Growth', price: '$99', detail: 'For scaling teams and departments' },
  { name: 'Enterprise', price: 'Custom', detail: 'For advanced compliance and custom flows' }
];

export default function HomePage() {
  return (
    <main className="landing">
      <header className="topbar">
        <div className="brand-wrap">
          <img src="/logo.svg" alt="DGEN logo" className="logo" />
          <div>
            <p className="brand-name">DGEN Technologies</p>
            <p className="brand-sub">Future-ready digital systems</p>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <a key={item} href="#" className="nav-link">
              {item}
            </a>
          ))}
        </nav>
        <div className="top-actions">
          <a href="/login" className="btn btn-soft">
            Login
          </a>
          <a href="/dashboard" className="btn btn-solid">
            Dashboard
          </a>
        </div>
      </header>

      <section className="hero" id="home">
        <p className="eyebrow">Placeholder Landing Page</p>
        <h1>One platform, every operation, fully visible.</h1>
        <p>
          This is your first full website layout with connected navigation, modern sections, and
          placeholder data. Backend integration is intentionally not connected yet.
        </p>
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
        <div className="grid-4">
          {serviceCards.map((card) => (
            <article key={card.title} className="panel reveal">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button type="button" className="text-link">
                Explore Option
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section split" id="products">
        <article className="panel">
          <p className="eyebrow">Platform Modules</p>
          <h2>Built as independent blocks, managed in one place</h2>
          <ul className="module-list">
            {modules.map((item) => (
              <li key={item}>{item} (Placeholder)</li>
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
        <div className="grid-3">
          {pricingPlans.map((plan) => (
            <article key={plan.name} className="panel">
              <h3>{plan.name}</h3>
              <p className="price">{plan.price}</p>
              <p>{plan.detail}</p>
              <button type="button" className="btn btn-soft full">
                Choose Plan
              </button>
            </article>
          ))}
        </div>
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
        <button type="button" className="btn btn-solid">
          Contact Sales (Placeholder)
        </button>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} DGEN Technologies Pvt. Ltd.</p>
        <p>All links and content currently use placeholders.</p>
      </footer>
    </main>
  );
}
