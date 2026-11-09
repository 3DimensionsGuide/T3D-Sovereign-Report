import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import { SUPPORT_EMAIL, PRIVACY_EMAIL } from '@/lib/contact';

export const metadata = {
  title: 'Terms of Use',
  alternates: { canonical: '/terms' },
  description: 'What you are buying from T3D, what it is and is not, and what each of us is responsible for.',
};

const S = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: 'clamp(28px,4vw,48px)' },
  h1:   { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, color: 'var(--parchment)', marginBottom: 8, lineHeight: 1.1 },
  meta: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--parchment-40)', marginBottom: 48 },
  h2:   { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: 'var(--parchment)', marginTop: 44, marginBottom: 14 },
  p:    { fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 16 },
  li:   { fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 8 },
  link: { color: 'var(--emerald)' },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={S.wrap}>
          <h1 style={S.h1}>Terms of Use</h1>
          <p style={S.meta}>Last updated: November 2026 · The 3 Dimensions (T3D) · 3dimensions.guide</p>

          <p style={S.p}>
            These terms cover the T3D website, the T3D iPhone app, and anything you buy from
            either. Using them means you accept what is written here. It is short on purpose, and
            written to be read rather than skimmed past.
          </p>

          <h2 style={S.h2}>What T3D Is</h2>
          <p style={S.p}>
            T3D reads your birth details through three systems — Human Design, numerology and
            astrology — and writes up what they say. You enter your name, birth date, birth time
            and birth place; we calculate a chart and produce a reading from it.
          </p>
          <p style={S.p}>
            It is a tool for reflection and self-understanding. That is the whole claim, and we do
            not make a larger one anywhere.
          </p>

          <h2 style={S.h2}>What It Is Not</h2>
          <p style={S.p}>
            T3D does not predict events. It is not medical, psychological, legal or financial
            advice, and nothing in a reading should be used in place of a doctor, a therapist, a
            lawyer or an accountant. If something in your life needs one of those, please go to
            one.
          </p>
          <p style={S.p}>
            Decisions are yours. A reading describes how you are built and what the conditions
            around you are doing; it does not tell you what to do, and we have deliberately
            written it so that it does not try.
          </p>
          <p style={S.p}>T3D is for people aged 13 and over.</p>

          <h2 style={S.h2}>Your Birth Details, and What They Decide</h2>
          <p style={S.p}>
            A chart is only as accurate as what it is built from. If a birth date, time or place
            is wrong, the reading will be wrong, and it will not look wrong — it will look like a
            reading about somebody else.
          </p>
          <p style={S.p}>
            Birth time matters more than people expect. When you do not give one, we calculate
            from 12:00 noon, and some of the chart genuinely cannot be settled that way. Where
            that is true, the reading says so rather than stating a single answer. Adding a birth
            time later settles it.
          </p>
          <p style={S.p}>
            Please check your details before you buy. We will correct a chart built on details you
            entered wrongly — see refunds below — but we cannot know they are wrong unless you
            tell us.
          </p>

          <h2 style={S.h2}>Buying a Report</h2>
          <p style={S.p}>
            Reports are digital. You pay once, the report is generated for your chart alone, and
            it is sent to the email address on the order along with a download link. There is no
            subscription and nothing recurring.
          </p>
          <p style={S.p}>
            Payment is handled by Stripe. We never see or store your card details — see the{' '}
            <a href="/privacy" style={S.link}>privacy policy</a> for what we do hold.
          </p>
          <p style={S.p}>
            Prices are in US dollars and shown before you pay. We may change prices for future
            orders; a price you have already paid is the price.
          </p>

          <h2 style={S.h2}>Refunds</h2>
          <p style={S.p}>
            There is no blanket policy, and we would rather say that plainly than publish one we
            do not mean. Every request is read by a person. Write to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a> with the email
            address on the order and what happened.
          </p>
          <p style={S.p}>
            Some things are not a judgement call, and you do not need to make a case for them. If
            the report did not arrive, the download link does not work, the file is broken, or the
            chart was calculated wrongly from details you entered correctly, tell us and we will
            fix it or refund it. If you entered a birth detail wrongly, tell us and we will
            regenerate the report from the corrected details at no charge.
          </p>
          <p style={S.p}>
            What we cannot do is undo having read it. A report is a file; once it is delivered it
            cannot be returned, so a request that amounts to having changed your mind afterwards
            is the part that depends on the circumstances.
          </p>

          <h2 style={S.h2}>Your Report, and Our Writing</h2>
          <p style={S.p}>
            Your report is yours. Keep it, print it, and share it with whoever you like.
          </p>
          <p style={S.p}>
            The writing inside it, the calculation methods behind it, and the T3D name and designs
            remain ours. Please do not resell it, republish it as your own, or use it to build a
            competing product. Quoting a piece of it with credit is fine and welcome.
          </p>

          <h2 style={S.h2}>Using the App and the Site</h2>
          <p style={S.p}>
            The app signs in with a token held on your phone. It is issued for your chart alone,
            and an email address is never a way into anybody&apos;s chart, including your own.
          </p>
          <p style={S.p}>Please do not:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li style={S.li}>try to reach another person&apos;s chart or account</li>
            <li style={S.li}>scrape, copy or resell the readings in bulk</li>
            <li style={S.li}>use automated tools to generate charts at volume</li>
            <li style={S.li}>interfere with the service or try to break it</li>
          </ul>
          <p style={S.p}>
            We may limit or close access that does these things. You can delete your own data at
            any time from the My Chart tab in the app, or by writing to{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} style={S.link}>{PRIVACY_EMAIL}</a>.
          </p>

          <h2 style={S.h2}>Availability</h2>
          <p style={S.p}>
            T3D is a small operation. We do not promise the site or the app will always be up, and
            features may change, improve or be removed. If something you have paid for stops
            working, that is covered by refunds above.
          </p>

          <h2 style={S.h2}>Responsibility</h2>
          <p style={S.p}>
            T3D is provided as it is. To the extent the law allows, we are not liable for
            decisions you make, for anything that follows from them, or for losses arising from
            using or being unable to use the service. Where we are liable, that liability is
            limited to what you paid us.
          </p>
          <p style={S.p}>
            Nothing here limits anything that cannot be limited by law, and if you have consumer
            rights where you live, these terms do not take them away.
          </p>

          <h2 style={S.h2}>Changes</h2>
          <p style={S.p}>
            These terms may change. The date at the top says when they last did. A change applies
            from the day it is posted, and never retroactively to an order already placed.
          </p>

          <h2 style={S.h2}>Governing Law</h2>
          <p style={S.p}>
            These terms are governed by the laws of the State of California, United States.
          </p>

          <h2 style={S.h2}>Contact</h2>
          <p style={S.p}>
            Anything about an order, a report or the app:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
            <br />
            Anything about your data or the privacy policy:{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} style={S.link}>{PRIVACY_EMAIL}</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
