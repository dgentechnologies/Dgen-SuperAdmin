import { MarketingShell } from '@/components/site-shell';
import { faqItems } from '@/lib/placeholder-content';

export default function FaqPage() {
  return (
    <MarketingShell
      eyebrow="FAQ"
      title="Questions, answers, and structure are already in place"
      description="This placeholder FAQ page is fully browsable and can later be backed by CMS or static content."
    >
      <section className="section">
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}