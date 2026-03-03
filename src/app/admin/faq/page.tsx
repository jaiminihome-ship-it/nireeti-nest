'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw, AlertCircle, ChevronUp, ChevronDown, HelpCircle, ToggleLeft, ToggleRight } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const FAQ_CATEGORIES = [
  'Shipping & Delivery',
  'Returns & Refunds',
  'Products',
  'Orders',
  'Payment',
  'Account',
  'General',
];

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    order: 0,
    isActive: true,
  });

  const fetchFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/faq');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setFaqs([]);
      } else if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      order: 0,
      isActive: true,
    });
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setFaqs([...faqs, data]);
        setDialogOpen(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to create FAQ');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      order: faq.order,
      isActive: faq.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingFaq) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/faq/${editingFaq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setFaqs(faqs.map(f => f.id === editingFaq.id ? data : f));
        setEditDialogOpen(false);
        setEditingFaq(null);
        resetForm();
      } else {
        alert(data.error || 'Failed to update FAQ');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFaqs(faqs.filter(f => f.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete FAQ');
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const res = await fetch(`/api/faq/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setFaqs(faqs.map(f => f.id === faq.id ? { ...f, isActive: !f.isActive } : f));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const moveFaq = async (faq: FAQ, direction: 'up' | 'down') => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= faqs.length) return;
    
    const newFaqs = [...faqs];
    const newOrder = faqs[newIndex].order;
    
    try {
      // Update both FAQs
      await Promise.all([
        fetch(`/api/faq/${faq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder }),
        }),
        fetch(`/api/faq/${faqs[newIndex].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: faq.order }),
        }),
      ]);
      
      [newFaqs[currentIndex], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[currentIndex]];
      setFaqs(newFaqs);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFaqs = filterCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === filterCategory);

  const FAQForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 py-4">
      <div>
        <Label>Question *</Label>
        <Input
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter the question"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Answer *</Label>
        <Textarea
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="Enter the answer"
          className="mt-1 min-h-[100px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {FAQ_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setEditDialogOpen(false);
              setEditingFaq(null);
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
          disabled={submitting || !formData.question || !formData.answer}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update FAQ' : 'Create FAQ')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFaqs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Add New FAQ
                </DialogTitle>
              </DialogHeader>
              <FAQForm />
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

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('all')}
        >
          All ({faqs.length})
        </Button>
        {FAQ_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={filterCategory === cat ? 'default' : 'outline'}
            onClick={() => setFilterCategory(cat)}
          >
            {cat} ({faqs.filter(f => f.category === cat).length})
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading FAQs...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredFaqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <HelpCircle className="h-12 w-12 text-gray-300" />
                    <p>No FAQs found</p>
                    <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                      Add your first FAQ
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFaqs.map((faq, index) => (
                <TableRow key={faq.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => moveFaq(faq, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <span className="text-center text-sm">{faq.order}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => moveFaq(faq, 'down')}
                        disabled={index === filteredFaqs.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{faq.question}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {faq.category ? (
                      <Badge variant="outline">{faq.category}</Badge>
                    ) : (
                      <span className="text-gray-400">No category</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`cursor-pointer ${
                        faq.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => handleToggleActive(faq)}
                    >
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Section */}
      {filteredFaqs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.filter(f => f.isActive).map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit FAQ
            </DialogTitle>
          </DialogHeader>
          <FAQForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
