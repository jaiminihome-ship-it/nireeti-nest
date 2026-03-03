'use client';

import { useState, useEffect } from 'react';
import { Gift, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

interface GiftOrder {
  id: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  message: string | null;
  deliveryDate: string | null;
  giftWrap: boolean;
  isAnonymous: boolean;
  total: number;
  status: string;
  sender: { name: string; email: string };
  product: { name: string };
  createdAt: string;
}

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<GiftOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/gifts')
      .then((res) => res.json())
      .then((data) => {
        setGifts(data.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleStatusChange = async (giftId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/gifts/${giftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setGifts(
          gifts.map((g) => (g.id === giftId ? { ...g, status: newStatus } : g))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredGifts = gifts.filter(
    (g) =>
      g.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      g.sender.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gift Orders</h1>
        <p className="text-gray-600">Manage gift orders and deliveries</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search gift orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gift Details</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredGifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No gift orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredGifts.map((gift) => (
                <TableRow key={gift.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{gift.receiverName}</p>
                        <p className="text-sm text-gray-500">{gift.receiverPhone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {gift.isAnonymous ? 'Anonymous' : gift.sender.name}
                    </p>
                    <p className="text-sm text-gray-500">{gift.sender.email}</p>
                  </TableCell>
                  <TableCell>{gift.product?.name || 'Unknown'}</TableCell>
                  <TableCell className="font-medium">{formatPrice(gift.total)}</TableCell>
                  <TableCell>
                    <Select
                      value={gift.status}
                      onValueChange={(value) => handleStatusChange(gift.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge className={getStatusColor(gift.status)}>
                          {gift.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{formatDate(gift.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
