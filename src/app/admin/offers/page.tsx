'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Tag, Edit, Calendar, Percent, DollarSign, Package, Image as ImageIcon, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import type { Offer, Product, Category } from '@/types';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    startDate: '',
    endDate: '',
    productId: '',
    categoryId: '',
    isActive: true,
    bannerImage: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
  });

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setOffers([]);
      } else if (Array.isArray(data)) {
        setOffers(data);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsAndCategories = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      if (Array.isArray(productsData)) setProducts(productsData);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch products/categories:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchProductsAndCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      startDate: '',
      endDate: '',
      productId: '',
      categoryId: '',
      isActive: true,
      bannerImage: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
    });
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        productId: formData.productId || null,
        categoryId: formData.categoryId || null,
        isActive: formData.isActive,
        bannerImage: formData.bannerImage || null,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };

      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setOffers([data, ...offers]);
        setDialogOpen(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to create offer');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      discountType: offer.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: offer.discountValue.toString(),
      startDate: new Date(offer.startDate).toISOString().slice(0, 16),
      endDate: new Date(offer.endDate).toISOString().slice(0, 16),
      productId: offer.productId || '',
      categoryId: offer.categoryId || '',
      isActive: offer.isActive,
      bannerImage: offer.bannerImage || '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingOffer) return;
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        productId: formData.productId || null,
        categoryId: formData.categoryId || null,
        isActive: formData.isActive,
        bannerImage: formData.bannerImage || null,
      };

      const res = await fetch(`/api/offers/${editingOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setOffers(offers.map(o => o.id === editingOffer.id ? data : o));
        setEditDialogOpen(false);
        setEditingOffer(null);
        resetForm();
      } else {
        alert(data.error || 'Failed to update offer');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers(offers.filter(o => o.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete offer');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete offer');
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setOffers(offers.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const OfferForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Sale 2024"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Offer description..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: 'PERCENTAGE' | 'FIXED') => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Value *</Label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 50'}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label>Active</Label>
          </div>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4 mt-4">
          <div>
            <Label>Apply to Product (Optional)</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => setFormData({ ...formData, productId: value, categoryId: '' })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Apply to Category (Optional)</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value, productId: '' })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div>
            <Label>Banner Image URL</Label>
            <Input
              value={formData.bannerImage}
              onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              placeholder="https://example.com/banner.jpg"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Purchase ($)</Label>
              <Input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                placeholder="e.g., 100"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Maximum Discount ($)</Label>
              <Input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="e.g., 50"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Usage Limit</Label>
            <Input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="Leave empty for unlimited"
              className="mt-1"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setEditDialogOpen(false);
              setEditingOffer(null);
            } else {
              setDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={submitting || !formData.title || !formData.discountValue || !formData.startDate || !formData.endDate}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Offer' : 'Create Offer')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
          <p className="text-gray-600">Create and manage special offers and discounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOffers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Create Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-amber-600" />
                  Create New Offer
                </DialogTitle>
              </DialogHeader>
              <OfferForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading offers...
                  </div>
                </TableCell>
              </TableRow>
            ) : offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="h-12 w-12 text-gray-300" />
                    <p>No offers found</p>
                    <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                      Create your first offer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => {
                const now = new Date();
                const isActive =
                  offer.isActive &&
                  new Date(offer.startDate) <= now &&
                  new Date(offer.endDate) >= now;
                const isUpcoming = new Date(offer.startDate) > now;
                const isExpired = new Date(offer.endDate) < now;

                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-green-100' : isUpcoming ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Tag className={`h-5 w-5 ${isActive ? 'text-green-600' : isUpcoming ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{offer.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {offer.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        {offer.discountType === 'PERCENTAGE' ? (
                          <>
                            <Percent className="h-4 w-4 text-amber-600" />
                            {offer.discountValue}%
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-amber-600" />
                            {offer.discountValue}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(offer.startDate)}</p>
                        <p className="text-gray-500">to {formatDate(offer.endDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {offer.product ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Package className="h-3 w-3 mr-1" />
                          {offer.product.name.substring(0, 20)}...
                        </Badge>
                      ) : offer.categoryId ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Category
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          All Products
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isActive
                            ? 'bg-green-100 text-green-800 cursor-pointer hover:bg-green-200'
                            : isUpcoming
                            ? 'bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200'
                        }
                        onClick={() => handleToggleActive(offer)}
                      >
                        {isActive ? 'Active' : isUpcoming ? 'Upcoming' : isExpired ? 'Expired' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-600" />
              Edit Offer
            </DialogTitle>
          </DialogHeader>
          <OfferForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
