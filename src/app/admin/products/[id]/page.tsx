'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X, Image as ImageIcon, Video } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateSlug, safeJsonParse, formatPrice } from '@/lib/utils';
import type { Category } from '@/types';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  videos: string[];
  categoryId: string;
  stock: number;
  sku?: string;
  barcode?: string;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  guarantee?: string;
  warranty?: string;
  returnPolicy?: string;
  deliveryTime?: string;
  deliveryCost?: number;
  material?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  style?: string;
  tags?: string;
  metaTitle?: string;
  metaDesc?: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<ProductData>({
    id: '',
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    price: 0,
    comparePrice: undefined,
    images: [],
    videos: [],
    categoryId: '',
    stock: 0,
    sku: '',
    barcode: '',
    featured: false,
    bestSeller: false,
    isNew: false,
    guarantee: '',
    warranty: '',
    returnPolicy: '',
    deliveryTime: '',
    deliveryCost: 0,
    material: '',
    dimensions: '',
    weight: '',
    color: '',
    style: '',
    tags: '',
    metaTitle: '',
    metaDesc: '',
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  useEffect(() => {
    params.then((p) => setProductId(p.id));
  }, [params]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            images: safeJsonParse<string[]>(data.images, []),
            videos: safeJsonParse<string[]>(data.videos || '[]', []),
          });
          setFetching(false);
        })
        .catch((err) => {
          console.error(err);
          setFetching(false);
        });
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(String(formData.price)),
          comparePrice: formData.comparePrice ? parseFloat(String(formData.comparePrice)) : null,
          deliveryCost: formData.deliveryCost ? parseFloat(String(formData.deliveryCost)) : null,
          stock: parseInt(String(formData.stock)),
          images: JSON.stringify(formData.images),
          videos: JSON.stringify(formData.videos),
        }),
      });

      if (res.ok) {
        router.push('/admin/products');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addVideo = () => {
    if (newVideoUrl.trim()) {
      setFormData({ ...formData, videos: [...formData.videos, newVideoUrl.trim()] });
      setNewVideoUrl('');
    }
  };

  const removeVideo = (index: number) => {
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index),
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-white border flex-wrap h-auto">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: formData.slug || generateSlug(e.target.value),
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Short Description</Label>
                  <Input
                    value={formData.shortDesc || ''}
                    onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                    placeholder="Brief description for product cards"
                    className="mt-1"
                    maxLength={150}
                  />
                </div>

                <div>
                  <Label>Full Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <Input
                      value={formData.tags || ''}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="modern, luxury, eco-friendly"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.bestSeller}
                      onCheckedChange={(checked) => setFormData({ ...formData, bestSeller: checked })}
                    />
                    <Label>Best Seller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isNew}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                    />
                    <Label>New Arrival</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-amber-600" />
                  Product Videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addVideo} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.videos.length > 0 && (
                  <div className="space-y-2">
                    {formData.videos.map((vid, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Video className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-sm truncate">{vid}</span>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing & Inventory */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Compare at Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.comparePrice || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, comparePrice: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                      placeholder="Original price for showing discount"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Barcode</Label>
                    <Input
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping & Returns */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Return Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Delivery Time</Label>
                    <Input
                      value={formData.deliveryTime || ''}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      placeholder="e.g., 3-5 Business Days"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Delivery Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.deliveryCost || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryCost: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                      placeholder="0 for free shipping"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Guarantee</Label>
                    <Input
                      value={formData.guarantee || ''}
                      onChange={(e) => setFormData({ ...formData, guarantee: e.target.value })}
                      placeholder="e.g., 30-Day Money Back"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Warranty</Label>
                    <Input
                      value={formData.warranty || ''}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="e.g., 2 Year Warranty"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Return Policy</Label>
                  <Textarea
                    value={formData.returnPolicy || ''}
                    onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                    placeholder="Describe your return policy..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specifications */}
          <TabsContent value="specs">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Material</Label>
                    <Input
                      value={formData.material || ''}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., Solid Oak Wood"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Dimensions</Label>
                    <Input
                      value={formData.dimensions || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="e.g., 80L x 36W x 30H inches"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Weight</Label>
                    <Input
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 45 lbs"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      value={formData.color || ''}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g., Walnut Brown"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Style</Label>
                  <Input
                    value={formData.style || ''}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    placeholder="e.g., Modern, Rustic, Scandinavian"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="SEO optimized title"
                    className="mt-1"
                    maxLength={60}
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={formData.metaDesc || ''}
                    onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                    placeholder="Brief description for search engines"
                    rows={3}
                    className="mt-1"
                    maxLength={160}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t mt-6">
          <Link href="/admin/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
