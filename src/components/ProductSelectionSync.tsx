'use client';

/**
 * Reads ?product=<slug> from the homepage URL (the pricing page links
 * here as /?product=<slug>#calculator) and stores it, so the calculator
 * flow carries the visitor's chosen tier all the way to checkout without
 * threading it through every component in between.
 *
 * Calls useSearchParams(), so it's rendered in its own <Suspense> boundary
 * from page.tsx rather than inline — same reasoning as ReportClient.tsx:
 * without the boundary, Next.js bails the whole page out of static
 * rendering. Renders nothing itself.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useT3DStore } from '@/store/useT3DStore';

export default function ProductSelectionSync() {
  const searchParams = useSearchParams();
  const setSelectedProduct = useT3DStore((s) => s.setSelectedProduct);

  useEffect(() => {
    const product = searchParams.get('product');
    if (product) {
      setSelectedProduct(product);
    }
  }, [searchParams, setSelectedProduct]);

  return null;
}
