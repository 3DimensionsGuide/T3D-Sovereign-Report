import type { Metadata } from 'next';
import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import CalculatorForm from '@/components/calculator/CalculatorForm';

export const metadata: Metadata = {
  title: 'Calculator',
  description: 'Enter your birth details and instantly see your Human Design type, Life Path number, and natal chart.',
};

export default function CalculatorPage() {
  return (
    <>
      <Nav />
      <main style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ borderBottom: '1px solid var(--grid)', padding: 'clamp(32px,5vh,56px) clamp(16px,4vw,40px) clamp(24px,4vh,40px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, background: 'var(--crimson)', display: 'block' }} aria-hidden />
              <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--parchment-faint)', letterSpacing: '0.18em' }}>
                [T3D.CALCULATOR] — THREE DIMENSIONS · ONE SUBMISSION
              </span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,5vw,3.8rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--parchment)', lineHeight: 1.08, maxWidth: '18ch' }}>
              Discover your sovereign profile.
            </h1>
            <p style={{ color: 'var(--parchment-faint)', marginTop: 14, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: '52ch' }}>
              All calculations run server-side. Your proprietary data never leaves the engine.
              Free · Instant · No credit card required.
            </p>
          </div>
          <div style={{ border: '1px solid var(--grid)', borderTop: 'none', background: 'var(--surface)' }}>
            <CalculatorForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
