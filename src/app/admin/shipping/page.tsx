'use client';

import { useState, useEffect } from 'react';
import { Save, Truck, RefreshCw, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  cost: number;
  freeShippingMin: number | null;
  estimatedDays: string;
  isActive: boolean;
}

interface ShippingSettings {
  defaultDeliveryTime: string;
  defaultDeliveryCost: number;
  freeShippingThreshold: number | null;
  expressShippingAvailable: boolean;
  expressShippingCost: number;
  internationalShipping: boolean;
  internationalBaseCost: number;
}

const DEFAULT_ZONES: ShippingZone[] = [
  {
    id: '1',
    name: 'Domestic (US)',
    countries: ['United States'],
    cost: 9.99,
    freeShippingMin: 75,
    estimatedDays: '3-5',
    isActive: true,
  },
  {
    id: '2',
    name: 'Canada',
    countries: ['Canada'],
    cost: 19.99,
    freeShippingMin: 150,
    estimatedDays: '5-7',
    isActive: true,
  },
  {
    id: '3',
    name: 'Europe',
    countries: ['UK', 'Germany', 'France', 'Italy', 'Spain'],
    cost: 29.99,
    freeShippingMin: 200,
    estimatedDays: '7-14',
    isActive: true,
  },
];

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings>({
    defaultDeliveryTime: '3-5 Business Days',
    defaultDeliveryCost: 9.99,
    freeShippingThreshold: 75,
    expressShippingAvailable: true,
    expressShippingCost: 19.99,
    internationalShipping: true,
    internationalBaseCost: 29.99,
  });
  const [formData, setFormData] = useState<Partial<ShippingZone>>({
    name: '',
    countries: [],
    cost: 0,
    freeShippingMin: null,
    estimatedDays: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings?key=shipping_settings');
      const data = await res.json();
      if (data.value) {
        const parsed = JSON.parse(data.value);
        setSettings(parsed.settings || settings);
        setZones(parsed.zones || DEFAULT_ZONES);
      } else {
        setZones(DEFAULT_ZONES);
      }
    } catch (err) {
      console.error(err);
      setZones(DEFAULT_ZONES);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'shipping_settings',
          value: JSON.stringify({ settings, zones }),
          type: 'json',
          group: 'shipping',
        }),
      });

      if (res.ok) {
        alert('Shipping settings saved successfully!');
      } else {
        alert('Failed to save shipping settings');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save shipping settings');
    } finally {
      setSaving(false);
    }
  };

  const addZone = () => {
    if (!formData.name || !formData.estimatedDays) return;
    
    const newZone: ShippingZone = {
      id: Date.now().toString(),
      name: formData.name || '',
      countries: formData.countries || [],
      cost: formData.cost || 0,
      freeShippingMin: formData.freeShippingMin || null,
      estimatedDays: formData.estimatedDays || '',
      isActive: formData.isActive ?? true,
    };
    
    setZones([...zones, newZone]);
    setDialogOpen(false);
    setFormData({
      name: '',
      countries: [],
      cost: 0,
      freeShippingMin: null,
      estimatedDays: '',
      isActive: true,
    });
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const toggleZoneActive = (id: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600">Configure shipping zones, rates, and delivery options</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-600" />
            Global Shipping Settings
          </CardTitle>
          <CardDescription>These settings apply to all products unless overridden at the product level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label>Default Delivery Time</Label>
              <Input
                value={settings.defaultDeliveryTime}
                onChange={(e) => setSettings({ ...settings, defaultDeliveryTime: e.target.value })}
                placeholder="e.g., 3-5 Business Days"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Default Delivery Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={settings.defaultDeliveryCost}
                onChange={(e) => setSettings({ ...settings, defaultDeliveryCost: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Free Shipping Threshold ($)</Label>
              <Input
                type="number"
                value={settings.freeShippingThreshold || ''}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Leave empty for no free shipping"
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={settings.expressShippingAvailable}
                onCheckedChange={(checked) => setSettings({ ...settings, expressShippingAvailable: checked })}
              />
              <Label>Express Shipping Available</Label>
            </div>
            {settings.expressShippingAvailable && (
              <div>
                <Label>Express Shipping Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.expressShippingCost}
                  onChange={(e) => setSettings({ ...settings, expressShippingCost: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
            )}
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={settings.internationalShipping}
                onCheckedChange={(checked) => setSettings({ ...settings, internationalShipping: checked })}
              />
              <Label>International Shipping</Label>
            </div>
            {settings.internationalShipping && (
              <div>
                <Label>International Base Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.internationalBaseCost}
                  onChange={(e) => setSettings({ ...settings, internationalBaseCost: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipping Zones</CardTitle>
              <CardDescription>Define shipping rates for different regions</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Zone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Shipping Zone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Zone Name</Label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., West Coast"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Shipping Cost ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Free Shipping Min ($)</Label>
                      <Input
                        type="number"
                        value={formData.freeShippingMin || ''}
                        onChange={(e) => setFormData({ ...formData, freeShippingMin: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="Optional"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Estimated Delivery Days</Label>
                    <Input
                      value={formData.estimatedDays || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                      placeholder="e.g., 3-5"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isActive ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={addZone} className="w-full bg-amber-600 hover:bg-amber-700">
                    Add Zone
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Free Shipping Min</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>${zone.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    {zone.freeShippingMin ? `$${zone.freeShippingMin}` : '-'}
                  </TableCell>
                  <TableCell>{zone.estimatedDays} days</TableCell>
                  <TableCell>
                    <Badge
                      className={`cursor-pointer ${
                        zone.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => toggleZoneActive(zone.id)}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeZone(zone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Product-Level Overrides</h4>
              <p className="text-blue-700 text-sm mt-1">
                You can override shipping settings for individual products in the product editor. 
                This is useful for oversized items or products with special delivery requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
