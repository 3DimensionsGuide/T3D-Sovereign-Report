/**
 * FAQ: plain answers to the questions people ask before they trust a birth-chart tool.
 * Server component built on <details>/<summary>, so it opens with the keyboard and works without JavaScript.
 * The same list feeds the FAQPage structured data, so what search engines read matches what people read.
 * Nothing here promises a refund policy, an app release or a result; add those only when they are true.
 */

export const FAQ_ITEMS: readonly { q: string; a: string }[] = [
  {
    q: 'Is this a prediction?',
    a: 'No. Human Design, Numerology and Astrology are interpretive traditions that people use for reflection. T3D describes patterns and gives you language for them. It does not tell you what will happen, and the decisions stay yours.',
  },
  {
    q: 'How accurate is the calculation?',
    a: 'Planet positions come from the Swiss Ephemeris, a professional astronomy library, and your birth time is converted using historical time zone and daylight saving rules. You can check your chart against astro.com or the Jovian Archive and compare the positions.',
  },
  {
    q: 'What if I do not know my birth time?',
    a: 'You can still run the calculator. If you leave the time out, noon is used. Your Sun sign, Life Path and most Numerology do not depend on the time. Your Rising sign, Moon position, and some Human Design details can shift within a day, so treat those as approximate until you confirm the time.',
  },
  {
    q: 'What is free and what is paid?',
    a: 'The calculator is free and shows you a first reading. The reports are paid, one-time downloads at three depths. The Pricing page lists what each one includes.',
  },
  {
    q: 'What do I get in a report?',
    a: 'A PDF written for your exact birth details, covering the Vehicle, the Road and the Stoplight, and how they fit together. You can download it right after you pay, and a copy is emailed to you.',
  },
  {
    q: 'Is my information private?',
    a: 'Yes. We do not sell your data or share it with advertisers. Payments are handled by Stripe, so your card details never reach us. You can ask us to delete your information at any time. The full details are in the privacy policy.',
  },
  {
    q: 'How do the three systems work together?',
    a: 'Each answers a different question. Human Design describes how you are built to make decisions, Numerology describes the stretch of life you are moving through, and Astrology describes the timing around you. T3D reads them as one guide: start with the Vehicle, check the Road, then watch the Stoplight.',
  },
  {
    q: 'Who can use T3D?',
    a: 'You must be at least 13 years old. T3D is for reflection and is not medical, legal or financial advice.',
  },
];

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export default function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      style={{ padding: 'clamp(56px,10vh,120px) clamp(20px,4vw,64px)', background: 'var(--base)', position: 'relative' }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()).replace(/</g, '\\u003c') }} />
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <p className="t3d-label" style={{ marginBottom: 20 }}>Questions</p>
        <h2 id="faq-heading" className="t3d-h2" style={{ marginBottom: 'clamp(28px,5vh,48px)' }}>
          Before you begin
        </h2>
        <div style={{ borderTop: '1px solid var(--grid-line)' }}>
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="faq-item" style={{ borderBottom: '1px solid var(--grid-line)' }}>
              <summary className="faq-summary">
                <span style={{ color: 'var(--parchment)', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(17px,2vw,20px)' }}>
                  {item.q}
                </span>
                <span aria-hidden className="faq-mark" />
              </summary>
              <p className="t3d-body" style={{ padding: '0 0 24px', maxWidth: 680 }}>{item.a}</p>
            </details>
          ))}
        </div>
        <p className="t3d-body" style={{ marginTop: 28 }}>
          Still have a question? Read the{' '}
          <a href="/privacy" style={{ color: 'var(--parchment)', textDecoration: 'underline', textUnderlineOffset: 4 }}>privacy policy</a>{' '}
          or email{' '}
          <a href="mailto:privacy@3dimensions.guide" style={{ color: 'var(--parchment)', textDecoration: 'underline', textUnderlineOffset: 4 }}>privacy@3dimensions.guide</a>.
        </p>
      </div>
    </section>
  );
}
