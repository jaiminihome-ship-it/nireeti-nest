'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product } from '@/types';

interface BestSellersSectionProps {
  products: Product[];
}

export default function BestSellersSection({ products }: BestSellersSectionProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Don't render anything if no products - admin controls content
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Best Sellers
            </h2>
            <p className="text-gray-600">
              Our most loved pieces by customers
            </p>
          </div>
          <Link href="/shop?bestSeller=true">
            <Button variant="outline" className="mt-4 md:mt-0" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
              View All
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const discount = product.comparePrice
              ? calculateDiscount(product.comparePrice, product.price)
              : 0;
            const image = product.images?.[0] || '/placeholder.jpg';

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                    <Link href={`/product/${product.slug}`}>
                      <button className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Eye className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-white">
                        -{discount}%
                      </Badge>
                    )}
                    {product.bestSeller && (
                      <Badge className="text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                        Best Seller
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(24)</span>
                  </div>

                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <Button
                    onClick={() => addItem(product as Product, 1)}
                    className="w-full text-white transition-colors gap-2"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>

                {/* 3D Effect Border */}
                <div className="absolute inset-0 rounded-2xl border border-gray-100 group-hover:border-gray-200 transition-colors pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
