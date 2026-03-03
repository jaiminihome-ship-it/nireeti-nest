'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, Heart, Truck, Shield, Star, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import type { Product, Category } from '@/types';

const giftCategories = [
  {
    id: 'birthday',
    name: 'Birthday Gifts',
    icon: '🎂',
    description: 'Perfect presents for special birthdays',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80',
  },
  {
    id: 'anniversary',
    name: 'Anniversary Gifts',
    icon: '💕',
    description: 'Celebrate your love story',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
  },
  {
    id: 'housewarming',
    name: 'Housewarming',
    icon: '🏠',
    description: 'Welcome to their new home',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  },
  {
    id: 'festival',
    name: 'Festival Gifts',
    icon: '🎉',
    description: 'Special gifts for festive seasons',
    image: 'https://images.unsplash.com/photo-1545996124-0501ebae84d0?w=800&q=80',
  },
];

export default function GiftsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);

  const [giftForm, setGiftForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    message: '',
    deliveryDate: '',
    giftWrap: true,
    isAnonymous: false,
    quantity: 1,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=12').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.data || []);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleGiftFormChange = (field: string, value: string | boolean | number) => {
    setGiftForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendGift = async () => {
    if (!user || !selectedProduct) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...giftForm,
          productId: selectedProduct.id,
          giftWrapPrice: giftForm.giftWrap ? 5 : 0,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setGiftDialogOpen(false);
          setSuccess(false);
          setSelectedProduct(null);
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const giftWrapPrice = 5;
  const productPrice = selectedProduct?.price || 0;
  const totalGiftPrice = productPrice * giftForm.quantity + (giftForm.giftWrap ? giftWrapPrice : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full container mx-auto px-4 flex items-center">
          <div className="text-white">
            <Badge className="bg-white/20 text-white mb-4 flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Gift Shop
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Send a Special Gift</h1>
            <p className="text-xl text-white/80 max-w-2xl">
              Make your loved ones feel special with our curated gift collection. 
              Add custom messages and gift wrapping!
            </p>
          </div>
        </div>

        {/* Decorative */}
        <Gift className="absolute top-20 right-20 h-32 w-32 text-white/10" />
        <Heart className="absolute bottom-20 left-1/3 h-24 w-24 text-white/10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Gift Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Gift Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftCategories.map((category) => (
              <div
                key={category.id}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <p className="text-sm text-white/80">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="h-16 w-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Gift Wrapping</h3>
            <p className="text-gray-600">Beautiful gift wrapping available for ${giftWrapPrice}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Personal Message</h3>
            <p className="text-gray-600">Add a custom message with your gift</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Scheduled Delivery</h3>
            <p className="text-gray-600">Choose your preferred delivery date</p>
          </div>
        </div>

        {/* Gift Products */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Gift Items</h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => {
                const image = product.images?.[0] || '/placeholder.jpg';

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <Badge className="absolute top-3 left-3 bg-pink-500 text-white">
                        Gift Item
                      </Badge>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-lg font-bold text-amber-600 mb-4">{formatPrice(product.price)}</p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addItem(product, 1)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Cart
                        </Button>
                        <Dialog open={giftDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                          setGiftDialogOpen(open);
                          if (open) setSelectedProduct(product);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                            >
                              <Gift className="h-4 w-4 mr-1" />
                              Gift
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Send as Gift</DialogTitle>
                            </DialogHeader>

                            {!isAuthenticated ? (
                              <div className="py-8 text-center">
                                <p className="text-gray-600 mb-4">Please login to send gifts</p>
                                <Link href="/auth/login">
                                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                    Login
                                  </Button>
                                </Link>
                              </div>
                            ) : success ? (
                              <div className="py-8 text-center">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <p className="text-lg font-medium text-gray-900">Gift Order Placed!</p>
                                <p className="text-gray-600">Your gift will be delivered soon.</p>
                              </div>
                            ) : (
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Receiver Name *</Label>
                                    <Input
                                      value={giftForm.receiverName}
                                      onChange={(e) => handleGiftFormChange('receiverName', e.target.value)}
                                      placeholder="John Doe"
                                    />
                                  </div>
                                  <div>
                                    <Label>Receiver Phone *</Label>
                                    <Input
                                      value={giftForm.receiverPhone}
                                      onChange={(e) => handleGiftFormChange('receiverPhone', e.target.value)}
                                      placeholder="+1 234 567 8900"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Delivery Address *</Label>
                                  <Textarea
                                    value={giftForm.receiverAddress}
                                    onChange={(e) => handleGiftFormChange('receiverAddress', e.target.value)}
                                    placeholder="Full address"
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label>Personal Message</Label>
                                  <Textarea
                                    value={giftForm.message}
                                    onChange={(e) => handleGiftFormChange('message', e.target.value)}
                                    placeholder="Write your heartfelt message..."
                                    rows={3}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Delivery Date</Label>
                                    <Input
                                      type="date"
                                      value={giftForm.deliveryDate}
                                      onChange={(e) => handleGiftFormChange('deliveryDate', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Quantity</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={giftForm.quantity}
                                      onChange={(e) => handleGiftFormChange('quantity', parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="giftWrap"
                                      checked={giftForm.giftWrap}
                                      onChange={(e) => handleGiftFormChange('giftWrap', e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="giftWrap">Gift Wrapping (+${giftWrapPrice})</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="anonymous"
                                      checked={giftForm.isAnonymous}
                                      onChange={(e) => handleGiftFormChange('isAnonymous', e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="anonymous">Send Anonymously</Label>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Product Price</span>
                                    <span>{formatPrice(productPrice * giftForm.quantity)}</span>
                                  </div>
                                  {giftForm.giftWrap && (
                                    <div className="flex justify-between mb-2 text-gray-600">
                                      <span>Gift Wrapping</span>
                                      <span>${giftWrapPrice}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-amber-600">{formatPrice(totalGiftPrice)}</span>
                                  </div>
                                </div>

                                <Button
                                  onClick={handleSendGift}
                                  disabled={submitting || !giftForm.receiverName || !giftForm.receiverPhone || !giftForm.receiverAddress}
                                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                                >
                                  {submitting ? 'Processing...' : 'Send Gift'}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
