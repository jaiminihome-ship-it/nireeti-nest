'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([
    { id: '1', title: 'Summer Sale', subtitle: 'Up to 50% off', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80', isActive: true, order: 1 },
    { id: '2', title: 'New Collection', subtitle: 'Check out our latest arrivals', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80', isActive: true, order: 2 },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '', link: '' });

  const handleCreate = async () => {
    const newBanner = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      order: banners.length + 1,
    };
    setBanners([...banners, newBanner]);
    setDialogOpen(false);
    setFormData({ title: '', subtitle: '', image: '', link: '' });
  };

  const handleDelete = (id: string) => {
    setBanners(banners.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-600">Manage homepage banners</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Image URL *</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Link</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreate} className="w-full bg-amber-600 hover:bg-amber-700">
                <Save className="h-4 w-4 mr-2" />
                Save Banner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="h-40 relative">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold">{banner.title}</h3>
                  <p className="text-sm">{banner.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <Badge className={banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => handleDelete(banner.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
