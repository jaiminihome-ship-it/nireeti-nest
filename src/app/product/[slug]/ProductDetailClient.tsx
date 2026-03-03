'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw, ShoppingCart, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product, Offer } from '@/types';

interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  offers?: Offer[];
}

export default function ProductDetailClient({ params }: { params: Promise<{ slug: string }> }) {
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
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
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
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/placeholder.jpg'];
  const discount = product.comparePrice ? calculateDiscount(product.comparePrice, product.price) : 0;

  // Check for active offers
  const activeOffer = product.offers?.find((offer) => {
    const now = new Date();
    return offer.isActive && new Date(offer.startDate) <= now && new Date(offer.endDate) >= now;
  });

  const finalPrice = activeOffer
    ? activeOffer.discountType === 'PERCENTAGE'
      ? product.price * (1 - activeOffer.discountValue / 100)
      : product.price - activeOffer.discountValue
    : product.price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-amber-600">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-amber-600">Shop</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/shop?category=${product.category?.slug}`} className="text-gray-500 hover:text-amber-600">
              {product.category?.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-[500px] bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-4 py-1">
                  -{discount}%
                </Badge>
              )}
              {activeOffer && (
                <Badge className="absolute top-4 right-4 bg-amber-600 text-white px-4 py-1">
                  Special Offer
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-amber-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">(24 reviews)</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-amber-600">
                {formatPrice(activeOffer ? finalPrice : product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {activeOffer && (
                <Badge className="bg-green-100 text-green-800">
                  Save {formatPrice(product.price - finalPrice)}
                </Badge>
              )}
            </div>

            {/* Offer Info */}
            {activeOffer && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">{activeOffer.title}</p>
                <p className="text-sm text-amber-600">{activeOffer.description}</p>
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {product.stock < 10 && product.stock > 0 && (
                <span className="text-orange-600 text-sm">Only {product.stock} left!</span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white gap-2"
                disabled={product.stock <= 0}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Guarantee/Warranty */}
            {(product.guarantee || product.warranty) && (
              <div className="grid grid-cols-2 gap-4">
                {product.guarantee && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Guarantee</p>
                      <p className="text-sm text-gray-600">{product.guarantee}</p>
                    </div>
                  </div>
                )}
                {product.warranty && (
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <RotateCcw className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Warranty</p>
                      <p className="text-sm text-gray-600">{product.warranty}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shipping Info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg">
              <Truck className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Free Shipping</p>
                <p className="text-sm text-gray-600">On orders over $100</p>
              </div>
            </div>

            {/* Product Tabs */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-4 bg-white rounded-lg border">
                <p className="text-gray-600">{product.description}</p>
              </TabsContent>
              <TabsContent value="specifications" className="p-4 bg-white rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{product.category?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-medium">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Stock</span>
                    <span className="font-medium">{product.stock} units</span>
                  </div>
                  {product.guarantee && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Guarantee</span>
                      <span className="font-medium">{product.guarantee}</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Warranty</span>
                      <span className="font-medium">{product.warranty}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="p-4 bg-white rounded-lg border">
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
