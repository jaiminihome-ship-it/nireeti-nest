'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Tag, Edit, RefreshCw, AlertCircle, Copy, Check, Percent, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { formatDate } from '@/lib/utils';
import type { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    maxUses: '',
    expiryDate: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setCoupons([]);
      } else if (Array.isArray(data)) {
        setCoupons(data);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      maxUses: '',
      expiryDate: '',
      isActive: true,
    });
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCoupons([data, ...coupons]);
        setDialogOpen(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to create coupon');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCoupon) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? data : c));
        setEditDialogOpen(false);
        setEditingCoupon(null);
        resetForm();
      } else {
        alert(data.error || 'Failed to update coupon');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CouponForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Code *</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            className="mt-1 font-mono"
          />
        </div>
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
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Discount Value *</Label>
          <Input
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '50'}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Min Purchase ($)</Label>
          <Input
            type="number"
            value={formData.minPurchase}
            onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
            placeholder="100"
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Discount ($)</Label>
          <Input
            type="number"
            value={formData.maxDiscount}
            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
            placeholder="50"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Max Uses</Label>
          <Input
            type="number"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            placeholder="Unlimited"
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Expiry Date</Label>
          <Input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="flex items-end pb-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label>Active</Label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setEditDialogOpen(false);
              setEditingCoupon(null);
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
          disabled={submitting || !formData.code || !formData.discountValue}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Create Coupon')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons Management</h1>
          <p className="text-gray-600">Create and manage discount coupon codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCoupons} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Create New Coupon
                </DialogTitle>
              </DialogHeader>
              <CouponForm />
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
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading coupons...
                  </div>
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="h-12 w-12 text-gray-300" />
                    <p>No coupons found</p>
                    <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                      Create your first coupon
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                const isExhausted = coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Tag className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-mono font-bold text-lg">{coupon.code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <>
                            <Percent className="h-4 w-4 text-purple-600" />
                            {coupon.discountValue}%
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            {coupon.discountValue}
                          </>
                        )}
                      </div>
                      {coupon.minPurchase && (
                        <p className="text-sm text-gray-500">Min: ${coupon.minPurchase}</p>
                      )}
                      {coupon.maxDiscount && (
                        <p className="text-sm text-gray-500">Max off: ${coupon.maxDiscount}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.maxUses ? (
                          <span>{coupon.maxUses} total</span>
                        ) : (
                          <span className="text-gray-500">Unlimited</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{
                              width: coupon.maxUses
                                ? `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`
                                : '0%',
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {coupon.usedCount}
                          {coupon.maxUses && `/${coupon.maxUses}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {coupon.expiryDate ? (
                          <span className={isExpired ? 'text-red-600' : ''}>
                            {formatDate(coupon.expiryDate)}
                          </span>
                        ) : (
                          <span className="text-gray-500">No expiry</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`cursor-pointer ${
                          !coupon.isActive
                            ? 'bg-gray-100 text-gray-800'
                            : isExpired
                            ? 'bg-red-100 text-red-800'
                            : isExhausted
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                        onClick={() => handleToggleActive(coupon)}
                      >
                        {!coupon.isActive ? 'Inactive' : isExpired ? 'Expired' : isExhausted ? 'Exhausted' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(coupon.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-purple-600" />
              Edit Coupon
            </DialogTitle>
          </DialogHeader>
          <CouponForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
