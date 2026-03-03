'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const discount = product.comparePrice
    ? calculateDiscount(product.comparePrice, product.price)
    : 0;

  const image = product.images?.[0] || '/placeholder.jpg';

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
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
          <button className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
          <Link href={`/product/${product.slug}`}>
            <button className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-colors">
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
            <Badge className="bg-amber-600 text-white">
              Best Seller
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-blue-500 text-white">
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-amber-600 font-medium mb-1">
            {product.category.name}
          </p>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-amber-400 text-amber-400"
            />
          ))}
          <span className="text-sm text-gray-500 ml-2">(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-amber-600">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock <= 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : product.stock < 5 ? (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Only {product.stock} left
            </Badge>
          ) : null}
        </div>

        {/* Add to Cart */}
        <Button
          onClick={() => addItem(product, 1)}
          className="w-full bg-gray-900 hover:bg-amber-600 text-white transition-colors gap-2"
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      {/* 3D Effect Border */}
      <div className="absolute inset-0 rounded-2xl border border-gray-100 group-hover:border-amber-200 transition-colors pointer-events-none" />
    </div>
  );
}
