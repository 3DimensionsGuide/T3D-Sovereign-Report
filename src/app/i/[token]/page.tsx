import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { checkInviteToken } from '@/server/inviteLinks';

/** An invite is private to whoever holds the link, so it is never indexed and never cached. */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'You have been invited',
  robots: { index: false, follow: false },
};

const firstNameOf = (v: string): string | null => {
  const cleaned = v.replace(/[^\p{L}\p{M} '’-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return cleaned || null;
};

async function loadInvite(token: string) {
  const check = checkInviteToken(token);
  if (!check.ok) return null;
  const rows = await db.select().from(leads).where(eq(leads.id, check.leadId)).limit(1);
  const lead = rows[0];
  if (!lead) return null;
  const results = lead.results as unknown as {
    humanDesign?: { type?: string };
    numerology?: { lifePath?: number };
    astrology?: { tropicalSun?: { sign?: string } };
  } | null;
  return {
    firstName: check.choices.showName ? firstNameOf(lead.firstName) : null,
    type: results?.humanDesign?.type ?? null,
    lifePath: results?.numerology?.lifePath ?? null,
    sunSign: results?.astrology?.tropicalSun?.sign ?? null,
  };
}

const wrap = { maxWidth: 520, margin: '0 auto', padding: 'clamp(28px,6vw,56px) 20px 80px' } as const;
const display = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, color: 'var(--color-parchment)' } as const;
const body = { fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.65, color: 'rgba(245,245,243,0.78)' } as const;
const gold = { background: 'var(--color-gold)', color: '#0B0B0C', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, borderRadius: 14, minHeight: 52, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' } as const;
const ghost = { ...gold, background: 'transparent', color: 'var(--color-parchment)', border: '1px solid rgba(245,245,243,0.3)' } as const;

function Row({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 14, display: 'grid', gap: 2 }}>
      <span style={{ ...body, fontSize: 13, fontWeight: 700, color: accent }}>{label}</span>
      <span style={{ ...display, fontSize: 24 }}>{value}</span>
    </div>
  );
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await loadInvite(token);

  if (!invite) {
    return (
      <main style={wrap}>
        <h1 style={{ ...display, fontSize: 'clamp(28px,6vw,38px)', lineHeight: 1.15 }}>This invite is no longer available</h1>
        <p style={{ ...body, marginTop: 14 }}>
          Invites last 30 days, and they stop working if the person who sent them removes their data.
          Ask them for a new one, or take a free first look at your own chart.
        </p>
        <div style={{ marginTop: 28 }}><a href="/" style={gold}>See your own free first look</a></div>
      </main>
    );
  }

  const who = invite.firstName ?? 'A friend';
  return (
    <main style={wrap}>
      <p style={{ ...body, fontSize: 13, letterSpacing: 2, color: 'var(--color-gold)', fontWeight: 700, margin: 0 }}>THE 3 DIMENSIONS</p>
      <h1 style={{ ...display, fontSize: 'clamp(30px,7vw,44px)', lineHeight: 1.12, margin: '14px 0 12px' }}>
        {who} invited you to see how your charts fit together
      </h1>
      <p style={body}>
        Open the invite in the T3D app. Add your birth date and you will see how the two of you decide, connect and move
        through time. You never need an account.
      </p>

      <div style={{ display: 'grid', gap: 18, margin: '32px 0', padding: 22, borderRadius: 18, border: '1px solid rgba(212,175,55,0.3)', background: '#17161A' }}>
        {invite.type ? <Row accent="var(--color-amber)" label="The Vehicle" value={invite.type} /> : null}
        {invite.lifePath ? <Row accent="var(--color-emerald)" label="The Road" value={`Life Path ${invite.lifePath}`} /> : null}
        {invite.sunSign ? <Row accent="var(--color-crimson)" label="The Stoplight" value={`Sun in ${invite.sunSign}`} /> : null}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <a href={`t3d://invite/${token}`} style={gold}>Open in the T3D app</a>
        <a href="/" style={ghost}>I do not have the app yet</a>
      </div>

      <p style={{ ...body, fontSize: 13, marginTop: 28, color: 'rgba(245,245,243,0.55)' }}>
        This page shows only a Type, Life Path and Sun sign. It never shows a birth date, time or place. Whatever you enter
        is used to build your view and is not saved.
      </p>
    </main>
  );
}
