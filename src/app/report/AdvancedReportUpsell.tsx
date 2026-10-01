'use client';

/**
 * Post-purchase upsell — shown on /report after a successful Sovereign
 * Report purchase, offering the Advanced Sovereign Report. This is the
 * one entry point in the app that links to
 * /checkout?product=advanced-sovereign-report today; there's no pricing
 * page or homepage placement yet, by design — this is the highest-intent
 * moment (someone who just paid and is about to read their results), not
 * a guess at where else to put it.
 *
 * Price is shown as a static "$97" rather than fetched — it mirrors the
 * `advanced-sovereign-report` products row (9700 cents) set via
 * scripts/upsert-product.ts. If that price ever changes, update this
 * string to match; checkout itself always shows the authoritative price
 * from the database regardless of what this teaser says.
 */

import Link from 'next/link';

const INCLUDES = [
  { label: 'VEHICLE',     color: 'var(--amber)',   text: 'Every gate, channel, bridge, and your full circuitry' },
  { label: 'ROAD',        color: 'var(--emerald)', text: 'All Four Pinnacles and Challenges, not just your current season' },
  { label: 'STOPLIGHT',   color: 'var(--crimson)', text: 'Every personal and outer planet, plus your live transits' },
  { label: 'INTEGRATION', color: 'var(--amber)',   text: 'How all three systems stack into one decision hierarchy' },
] as const;

export default function AdvancedReportUpsell({ leadId }: { leadId: number }) {
  return (
    <div
      className="t3d-card"
      style={{
        marginTop: 56,
        padding: 'clamp(28px,4vw,40px)',
        textAlign: 'left',
      }}
    >
      <p className="t3d-label" style={{ color: 'var(--amber)', marginBottom: 14 }}>
        [GO DEEPER] — FOR THOSE WHO WANT MORE
      </p>

      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(1.4rem,3vw,1.9rem)',
        fontWeight: 400,
        color: 'var(--parchment)',
        lineHeight: 1.2,
        marginBottom: 14,
      }}>
        Your Sovereign Report is the map. The Advanced Report is the terrain.
      </p>

      <p className="t3d-body" style={{ fontSize: 15, marginBottom: 24 }}>
        Same three systems — Vehicle, Road, Stoplight — read at full depth
        instead of summary. Every active gate and channel, every Pinnacle
        and Challenge across your whole life, every personal and outer
        planet, and your live transits right now.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
        {INCLUDES.map((item, i) => (
          <div key={item.label} style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            padding: '12px 0',
            borderBottom: i < INCLUDES.length - 1 ? '1px solid var(--card-border)' : 'none',
          }}>
            <span className="t3d-label" style={{ color: item.color, flexShrink: 0, width: 92 }}>
              {item.label}
            </span>
            <span className="t3d-body" style={{ fontSize: 14, margin: 0 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.3rem,2.5vw,1.7rem)',
          color: 'var(--amber)',
          fontWeight: 400,
        }}>
          $97
        </span>

        <Link
          href={`/checkout?product=advanced-sovereign-report&leadId=${leadId}`}
          className="t3d-cta"
          style={{ display: 'inline-flex', padding: '16px 36px' }}
        >
          UNLOCK THE ADVANCED REPORT
        </Link>
      </div>
    </div>
  );
}
