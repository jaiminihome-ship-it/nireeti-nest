'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Tag, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount, getCountdown, safeJsonParse } from '@/lib/utils';
import type { Offer, Product } from '@/types';

interface OfferWithProduct extends Offer {
  product: Product | null;
}

function CountdownTimer({ endDate }: { endDate: Date | string }) {
  const [countdown, setCountdown] = useState(getCountdown(new Date(endDate)));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(new Date(endDate)));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0) {
    return <span className="text-red-500 font-medium">Expired</span>;
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Clock className="h-4 w-4 text-red-500" />
      <span className="text-gray-600">Ends in:</span>
      <div className="flex space-x-1">
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono">
          {countdown.days}d
        </span>
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono">
          {countdown.hours}h
        </span>
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono">
          {countdown.minutes}m
        </span>
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono animate-pulse">
          {countdown.seconds}s
        </span>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/offers?active=true');
        const data = await res.json();
        // Parse images for each product
        const parsedOffers = (data || []).map((offer: OfferWithProduct) => ({
          ...offer,
          product: offer.product ? {
            ...offer.product,
            images: typeof offer.product.images === 'string' 
              ? safeJsonParse<string[]>(offer.product.images, [])
              : offer.product.images || [],
          } : null,
        }));
        setOffers(parsedOffers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: 100 }),
      });

      const data = await res.json();

      if (data.valid) {
        setCouponMessage({ type: 'success', text: `Coupon applied! You save ${formatPrice(data.discount)}` });
      } else {
        setCouponMessage({ type: 'error', text: data.message });
      }
    } catch {
      setCouponMessage({ type: 'error', text: 'Failed to validate coupon' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-80 bg-amber-100 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-amber-50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Hero Banner with Decorative Pattern */}
      <div className="relative h-[500px] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-orange-600 to-red-700">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-32 w-56 h-56 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-red-400/10 rounded-full blur-2xl" />
        
        {/* Content */}
        <div className="relative h-full container mx-auto px-4 flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Clock className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Limited Time Offers</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Special Offers
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Transform your home with our exclusive deals. Premium quality furniture and decor at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 font-semibold shadow-xl">
                  Shop All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Coupon Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16 border border-amber-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Tag className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">Have a Coupon Code?</h2>
              </div>
              <p className="text-gray-600">Enter your code below to unlock exclusive discounts</p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code (try WELCOME10)"
                className="w-full lg:w-72 h-12 text-lg border-amber-200 focus:border-amber-500"
              />
              <Button 
                onClick={handleApplyCoupon} 
                className="h-12 px-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium"
              >
                Apply
              </Button>
            </div>
          </div>
          
          {couponMessage && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                couponMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {couponMessage.type === 'success' ? (
                <span className="text-2xl">🎉</span>
              ) : (
                <span className="text-2xl">⚠️</span>
              )}
              {couponMessage.text}
            </div>
          )}
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Tag className="h-12 w-12 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Offers</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Check back soon for amazing deals on premium home decor!
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.filter(offer => offer.product).map((offer) => {
              const product = offer.product!;
              const images = Array.isArray(product.images) ? product.images : [];
              const image = images[0] || '/placeholder.jpg';
              const discountPercent =
                offer.discountType === 'PERCENTAGE'
                  ? offer.discountValue
                  : calculateDiscount(product.price, product.price - offer.discountValue);
              const finalPrice =
                offer.discountType === 'PERCENTAGE'
                  ? product.price * (1 - offer.discountValue / 100)
                  : product.price - offer.discountValue;

              return (
                <div
                  key={offer.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-amber-100"
                >
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg">
                        -{Math.round(discountPercent)}%
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3">
                      <CountdownTimer endDate={offer.endDate} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

                    {/* Product Info */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-amber-600 font-medium">{product.name}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-amber-600">
                            {formatPrice(finalPrice)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addItem(product as any, 1)}
                        className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium gap-2"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </Button>
                      <Link href={`/product/${product.slug}`}>
                        <Button variant="outline" className="h-12 px-6 border-amber-200 hover:bg-amber-50">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
