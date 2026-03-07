'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw, ShoppingCart, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount, safeJsonParse } from '@/lib/utils';
import type { Product, Offer } from '@/types';

interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  offers?: Offer[];
}

export default function ProductDetailClient() {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;

  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (slug) {
      fetch(`/api/products/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            // Fix: Images string ko array mein convert karna zaroori hai
            const parsedProduct = {
              ...data,
              images: typeof data.images === 'string' 
                ? safeJsonParse<string[]>(data.images, []) 
                : (Array.isArray(data.images) ? data.images : [])
            };
            setProduct(parsedProduct);
          } else {
            setProduct(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch Error:', err);
          setLoading(false);
        });
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[500px] bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/shop">
            <Button className="bg-amber-600">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Double Check for Images Array
  const productImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ['/placeholder.jpg'];

  const discount = product.comparePrice ? calculateDiscount(product.comparePrice, product.price) : 0;

  const activeOffer = Array.isArray(product.offers) ? product.offers.find((offer) => {
    const now = new Date();
    return offer.isActive && new Date(offer.startDate) <= now && new Date(offer.endDate) >= now;
  }) : null;

  const finalPrice = activeOffer
    ? activeOffer.discountType === 'PERCENTAGE'
      ? product.price * (1 - activeOffer.discountValue / 100)
      : product.price - activeOffer.discountValue
    : product.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-amber-600">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-amber-600">Shop</Link>
            <span className="text-gray-400">/</span>
            {product.category && (
              <>
                <Link href={`/shop?category=${product.category.slug}`} className="text-gray-500 hover:text-amber-600">
                  {product.category.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative h-[400px] md:h-[500px] bg-white rounded-2xl overflow-hidden shadow-sm border">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-4 py-1">
                  -{discount}%
                </Badge>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-amber-600 shadow-md' : 'border-gray-100'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2 text-amber-700 border-amber-200 bg-amber-50">
                {product.category?.name || 'Home Decor'}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">(Best Rated)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">SKU: {product.sku || 'NN-CUSTOM'}</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-amber-600">
                {formatPrice(finalPrice)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="flex items-center space-x-4 py-4 border-y border-gray-100">
              <span className="font-semibold text-gray-900">Quantity</span>
              <div className="flex items-center border rounded-xl bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:text-amber-600"><Minus className="h-4 w-4" /></button>
                <span className="px-4 font-medium min-w-[50px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:text-amber-600"><Plus className="h-4 w-4" /></button>
              </div>
              <span className="text-sm text-gray-500">{product.stock} available</span>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 h-14 bg-amber-600 hover:bg-amber-700 text-white text-lg rounded-xl shadow-lg shadow-amber-200"
                disabled={product.stock <= 0}
              >
                {addedToCart ? <><Check className="mr-2" /> In Cart</> : <><ShoppingCart className="mr-2" /> Add to Cart</>}
              </Button>
              <Button variant="outline" className="h-14 w-14 rounded-xl border-gray-200"><Heart className="h-6 w-6 text-gray-400" /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <Truck className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}