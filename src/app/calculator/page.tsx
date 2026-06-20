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
      <main id="calculator" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1140, margin: '0 auto',
          padding: 'clamp(48px,8vh,88px) clamp(20px,5vw,48px) clamp(64px,10vh,120px)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '54ch', margin: '0 auto clamp(40px,6vh,64px)' }}>
            <p style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
              The T3D Calculator
            </p>
            <h1 className="font-display" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.08, marginBottom: 16 }}>
              Discover your three dimensions
            </h1>
            <p style={{ color: 'var(--ink-dim)', fontSize: 'clamp(0.95rem,1.6vw,1.1rem)', lineHeight: 1.65 }}>
              Enter your birth details below. All calculations run server-side in seconds.
              Your profile is free — no credit card required.
            </p>
          </div>
          <div style={{
            maxWidth: 800, margin: '0 auto',
            background: 'var(--obsidian)',
            border: '1px solid var(--purple-line)',
            borderRadius: 24,
            padding: 'clamp(28px,4vw,52px)',
          }}>
            <CalculatorForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
