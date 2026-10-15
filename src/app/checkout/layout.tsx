import type { Metadata } from 'next';

// Checkout is a private step, so it stays out of search results. The page itself is a client component.
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
