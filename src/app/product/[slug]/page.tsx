import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

export const metadata = {
  title: 'Product - HomeDecor',
  description: 'View product details',
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
