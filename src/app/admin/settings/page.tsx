'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Palette, Type, Image as ImageIcon, Globe, Mail, Phone, MapPin, Eye, EyeOff, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Layout } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  faviconUrl: string;
  footerBgColor: string;
  footerTextColor: string;
  footerAccentColor: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialPinterest: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  // Payment Settings
  upiEnabled: boolean;
  upiId: string;
  upiPayeeName: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecret: string;
  paypalMode: string;
  // Section visibility
  showTestimonials: boolean;
  showNewsletter: boolean;
  showOurStory: boolean;
  // Our Story Section
  ourStoryTitle: string;
  ourStorySubtitle: string;
  ourStoryDescription1: string;
  ourStoryDescription2: string;
  ourStoryImage1: string;
  ourStoryImage2: string;
  ourStoryImage3: string;
  ourStoryImage4: string;
  // Features
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  feature4Title: string;
  feature4Description: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'The Nireeti Nest',
  siteTagline: 'Curated Home Essentials for Modern Living',
  primaryColor: '#B45309',
  secondaryColor: '#D2691E',
  accentColor: '#F5DEB3',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  footerBgColor: '#111827',
  footerTextColor: '#D1D5DB',
  footerAccentColor: '#D97706',
  footerText: '© 2024 The Nireeti Nest. All rights reserved.',
  contactEmail: 'support@thenireetinest.com',
  contactPhone: '+1 234 567 8900',
  address: '123 Decor Street, Design City, DC 12345',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialPinterest: '',
  metaTitle: 'The Nireeti Nest - Premium Home Decor & Essentials',
  metaDescription: 'Discover curated home decor and essentials at The Nireeti Nest. Quality craftsmanship meets modern design for your perfect living space.',
  metaKeywords: 'home decor, furniture, interior design, living room, bedroom',
  upiEnabled: false,
  upiId: '',
  upiPayeeName: '',
  razorpayEnabled: false,
  razorpayKeyId: '',
  razorpayKeySecret: '',
  paypalEnabled: false,
  paypalClientId: '',
  paypalSecret: '',
  paypalMode: 'sandbox',
  showTestimonials: true,
  showNewsletter: true,
  showOurStory: true,
  ourStoryTitle: 'Our Story',
  ourStorySubtitle: 'Crafting Beautiful Spaces Since 2010',
  ourStoryDescription1: 'Founded in 2010, The Nireeti Nest began with a simple mission: to make beautiful, high-quality home furnishings accessible to everyone. What started as a small workshop has grown into a trusted brand that helps thousands of customers create spaces they love.',
  ourStoryDescription2: 'We believe that your home should reflect your unique personality and style. That\'s why we work with talented artisans from around the world to bring you pieces that are both beautiful and functional.',
  ourStoryImage1: '',
  ourStoryImage2: '',
  ourStoryImage3: '',
  ourStoryImage4: '',
  feature1Title: 'Quality Craftsmanship',
  feature1Description: 'Every piece is crafted with meticulous attention to detail using premium materials.',
  feature2Title: 'Sustainable Materials',
  feature2Description: 'We prioritize eco-friendly and sustainably sourced materials in all our products.',
  feature3Title: 'Made with Love',
  feature3Description: 'Our artisans pour their passion and expertise into every creation.',
  feature4Title: 'Free Shipping',
  feature4Description: 'Enjoy complimentary shipping on all orders above $100.',
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
          upiEnabled: data.upiEnabled === true,
          razorpayEnabled: data.razorpayEnabled === true,
          paypalEnabled: data.paypalEnabled === true,
          showTestimonials: data.showTestimonials !== false,
          showNewsletter: data.showNewsletter !== false,
          showOurStory: data.showOurStory !== false,
        });
      }
    } catch (error) {
      console.error(error);
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
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        alert('Settings saved successfully! Refresh the frontend to see changes.');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const colorFields = [
    { key: 'primaryColor', label: 'Primary Color' },
    { key: 'secondaryColor', label: 'Secondary Color' },
    { key: 'accentColor', label: 'Accent Color' },
    { key: 'backgroundColor', label: 'Background Color' },
    { key: 'textColor', label: 'Text Color' },
  ];

  const footerColorFields = [
    { key: 'footerBgColor', label: 'Footer Background' },
    { key: 'footerTextColor', label: 'Footer Text Color' },
    { key: 'footerAccentColor', label: 'Footer Accent Color' },
  ];

  const sectionControls = [
    { key: 'showTestimonials', label: 'Testimonials Section', description: 'Show customer testimonials on homepage' },
    { key: 'showNewsletter', label: 'Newsletter Section', description: 'Show newsletter subscription on homepage' },
    { key: 'showOurStory', label: 'Our Story Section', description: 'Show our story section on homepage' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600">Configure your website appearance, branding, and payment options</p>
        </div>
        <Button
          onClick={handleSave}
          className="text-white"
          style={{ backgroundColor: settings.primaryColor }}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="bg-white border flex-wrap h-auto">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="ourstory">Our Story</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" style={{ color: settings.primaryColor }} />
                  Site Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={settings.siteTagline}
                    onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Footer Copyright Text</Label>
                  <Input
                    value={settings.footerText}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" style={{ color: settings.primaryColor }} />
                  Logo & Favicon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Logo URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://your-logo-url.com/logo.png"
                      className="flex-1"
                    />
                  </div>
                  {settings.logoUrl && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={settings.logoUrl}
                        alt="Site logo preview"
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Favicon URL</Label>
                  <Input
                    value={settings.faviconUrl}
                    onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" style={{ color: settings.primaryColor }} />
                Brand Colors
              </CardTitle>
              <CardDescription>These colors will be applied globally across the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {colorFields.map((field) => (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings[field.key as keyof SiteSettings] as string}
                        onChange={(e) =>
                          setSettings({ ...settings, [field.key]: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings[field.key as keyof SiteSettings] as string}
                        onChange={(e) =>
                          setSettings({ ...settings, [field.key]: e.target.value })
                        }
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Preview */}
              <div className="p-6 border rounded-xl bg-gray-50">
                <p className="text-sm text-gray-600 mb-4 font-medium">Live Preview</p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      className="px-6 py-3 rounded-lg text-white font-medium shadow-lg"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg text-white font-medium shadow-lg"
                      style={{ backgroundColor: settings.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-medium border-2 shadow-lg"
                      style={{
                        backgroundColor: settings.accentColor,
                        borderColor: settings.primaryColor,
                      }}
                    >
                      Accent
                    </button>
                  </div>
                  <div
                    className="p-6 rounded-xl"
                    style={{
                      backgroundColor: settings.backgroundColor,
                      color: settings.textColor,
                    }}
                  >
                    <h3 className="font-bold text-lg mb-2">Sample Content</h3>
                    <p className="opacity-80">
                      This is how your content will look with the selected colors.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" style={{ color: settings.primaryColor }} />
                Homepage Sections
              </CardTitle>
              <CardDescription>Control which sections appear on the homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectionControls.map((section) => (
                  <div
                    key={section.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {settings[section.key as keyof SiteSettings] ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{section.label}</p>
                        <p className="text-sm text-gray-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings[section.key as keyof SiteSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, [section.key]: checked })
                        }
                      />
                      <Badge
                        variant={settings[section.key as keyof SiteSettings] ? 'default' : 'secondary'}
                        className={settings[section.key as keyof SiteSettings] ? 'bg-green-100 text-green-800' : ''}
                      >
                        {settings[section.key as keyof SiteSettings] ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Our Story Tab */}
        <TabsContent value="ourstory">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" style={{ color: settings.primaryColor }} />
                  Our Story Content
                </CardTitle>
                <CardDescription>Edit the "Our Story" section displayed on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={settings.ourStoryTitle}
                      onChange={(e) => setSettings({ ...settings, ourStoryTitle: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input
                      value={settings.ourStorySubtitle}
                      onChange={(e) => setSettings({ ...settings, ourStorySubtitle: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>First Paragraph</Label>
                  <Textarea
                    value={settings.ourStoryDescription1}
                    onChange={(e) => setSettings({ ...settings, ourStoryDescription1: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Second Paragraph</Label>
                  <Textarea
                    value={settings.ourStoryDescription2}
                    onChange={(e) => setSettings({ ...settings, ourStoryDescription2: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" style={{ color: settings.primaryColor }} />
                  Our Story Images
                </CardTitle>
                <CardDescription>Add image URLs for the Our Story section grid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Image 1 URL (Top Left)</Label>
                    <Input
                      value={settings.ourStoryImage1}
                      onChange={(e) => setSettings({ ...settings, ourStoryImage1: e.target.value })}
                      placeholder="https://example.com/image1.jpg"
                      className="mt-1"
                    />
                    {settings.ourStoryImage1 && (
                      <img src={settings.ourStoryImage1} alt="Preview 1" className="mt-2 h-24 object-cover rounded" />
                    )}
                  </div>
                  <div>
                    <Label>Image 2 URL (Bottom Left)</Label>
                    <Input
                      value={settings.ourStoryImage2}
                      onChange={(e) => setSettings({ ...settings, ourStoryImage2: e.target.value })}
                      placeholder="https://example.com/image2.jpg"
                      className="mt-1"
                    />
                    {settings.ourStoryImage2 && (
                      <img src={settings.ourStoryImage2} alt="Preview 2" className="mt-2 h-24 object-cover rounded" />
                    )}
                  </div>
                  <div>
                    <Label>Image 3 URL (Top Right)</Label>
                    <Input
                      value={settings.ourStoryImage3}
                      onChange={(e) => setSettings({ ...settings, ourStoryImage3: e.target.value })}
                      placeholder="https://example.com/image3.jpg"
                      className="mt-1"
                    />
                    {settings.ourStoryImage3 && (
                      <img src={settings.ourStoryImage3} alt="Preview 3" className="mt-2 h-24 object-cover rounded" />
                    )}
                  </div>
                  <div>
                    <Label>Image 4 URL (Bottom Right)</Label>
                    <Input
                      value={settings.ourStoryImage4}
                      onChange={(e) => setSettings({ ...settings, ourStoryImage4: e.target.value })}
                      placeholder="https://example.com/image4.jpg"
                      className="mt-1"
                    />
                    {settings.ourStoryImage4 && (
                      <img src={settings.ourStoryImage4} alt="Preview 4" className="mt-2 h-24 object-cover rounded" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Cards</CardTitle>
                <CardDescription>Edit the four feature cards displayed in the Our Story section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Feature {num}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={settings[`feature${num}Title` as keyof SiteSettings] as string}
                          onChange={(e) => setSettings({ ...settings, [`feature${num}Title`]: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={settings[`feature${num}Description` as keyof SiteSettings] as string}
                          onChange={(e) => setSettings({ ...settings, [`feature${num}Description`]: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" style={{ color: settings.primaryColor }} />
                Footer Styling
              </CardTitle>
              <CardDescription>Customize the appearance of your website footer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {footerColorFields.map((field) => (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings[field.key as keyof SiteSettings] as string}
                        onChange={(e) =>
                          setSettings({ ...settings, [field.key]: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings[field.key as keyof SiteSettings] as string}
                        onChange={(e) =>
                          setSettings({ ...settings, [field.key]: e.target.value })
                        }
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Preview */}
              <div className="p-6 border rounded-xl overflow-hidden">
                <p className="text-sm text-gray-600 mb-4 font-medium">Footer Preview</p>
                <div
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: settings.footerBgColor }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="h-8 w-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: settings.footerAccentColor }}
                    >
                      <span className="text-white font-bold">
                        {settings.siteName.charAt(0)}
                      </span>
                    </div>
                    <span className="font-bold text-white">{settings.siteName}</span>
                  </div>
                  <p style={{ color: settings.footerTextColor, opacity: 0.8 }} className="text-sm">
                    Sample footer text with your chosen colors
                  </p>
                  <div className="flex gap-2 mt-4">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <span style={{ color: settings.footerTextColor }}>f</span>
                    </div>
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <span style={{ color: settings.footerTextColor }}>in</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <div className="space-y-6">
            {/* UPI Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      UPI Payment
                    </CardTitle>
                    <CardDescription>Accept payments via UPI (India)</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.upiEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, upiEnabled: checked })}
                    />
                    <Label>{settings.upiEnabled ? 'Enabled' : 'Disabled'}</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={settings.upiEnabled ? 'default' : 'secondary'} className={settings.upiEnabled ? 'bg-green-100 text-green-800' : ''}>
                    {settings.upiEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>UPI ID</Label>
                    <Input
                      value={settings.upiId}
                      onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                      placeholder="yourname@upi"
                      className="mt-1"
                      disabled={!settings.upiEnabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
                    </p>
                  </div>
                  <div>
                    <Label>Payee Name</Label>
                    <Input
                      value={settings.upiPayeeName}
                      onChange={(e) => setSettings({ ...settings, upiPayeeName: e.target.value })}
                      placeholder="Your Business Name"
                      className="mt-1"
                      disabled={!settings.upiEnabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Business name to display in UPI payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Razorpay Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Razorpay
                    </CardTitle>
                    <CardDescription>Accept payments via Razorpay gateway</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.razorpayEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, razorpayEnabled: checked })}
                    />
                    <Label>{settings.razorpayEnabled ? 'Enabled' : 'Disabled'}</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={settings.razorpayEnabled ? 'default' : 'secondary'} className={settings.razorpayEnabled ? 'bg-blue-100 text-blue-800' : ''}>
                    {settings.razorpayEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Key ID</Label>
                    <Input
                      value={settings.razorpayKeyId}
                      onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                      placeholder="rzp_test_xxxxxxxx"
                      className="mt-1 font-mono"
                      disabled={!settings.razorpayEnabled}
                    />
                  </div>
                  <div>
                    <Label>Key Secret</Label>
                    <Input
                      type="password"
                      value={settings.razorpayKeySecret}
                      onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                      placeholder="••••••••••••"
                      className="mt-1"
                      disabled={!settings.razorpayEnabled}
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Get your API keys from{' '}
                    <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">
                      Razorpay Dashboard
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PayPal Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-yellow-600" />
                      PayPal
                    </CardTitle>
                    <CardDescription>Accept international payments via PayPal</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paypalEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, paypalEnabled: checked })}
                    />
                    <Label>{settings.paypalEnabled ? 'Enabled' : 'Disabled'}</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={settings.paypalEnabled ? 'default' : 'secondary'} className={settings.paypalEnabled ? 'bg-yellow-100 text-yellow-800' : ''}>
                    {settings.paypalEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client ID</Label>
                    <Input
                      value={settings.paypalClientId}
                      onChange={(e) => setSettings({ ...settings, paypalClientId: e.target.value })}
                      placeholder="AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"
                      className="mt-1 font-mono text-sm"
                      disabled={!settings.paypalEnabled}
                    />
                  </div>
                  <div>
                    <Label>Secret</Label>
                    <Input
                      type="password"
                      value={settings.paypalSecret}
                      onChange={(e) => setSettings({ ...settings, paypalSecret: e.target.value })}
                      placeholder="••••••••••••"
                      className="mt-1"
                      disabled={!settings.paypalEnabled}
                    />
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Get your API credentials from{' '}
                    <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">
                      PayPal Developer Dashboard
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" style={{ color: settings.primaryColor }} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </Label>
                  <Input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Address
                </Label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add your social media profile URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Facebook</Label>
                  <Input
                    placeholder="https://facebook.com/yourpage"
                    value={settings.socialFacebook}
                    onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    placeholder="https://instagram.com/yourpage"
                    value={settings.socialInstagram}
                    onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input
                    placeholder="https://twitter.com/yourpage"
                    value={settings.socialTwitter}
                    onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Pinterest</Label>
                  <Input
                    placeholder="https://pinterest.com/yourpage"
                    value={settings.socialPinterest}
                    onChange={(e) => setSettings({ ...settings, socialPinterest: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your site for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  className="mt-1"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.metaTitle.length}/60 characters
                </p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  rows={3}
                  className="mt-1"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.metaDescription.length}/160 characters
                </p>
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input
                  value={settings.metaKeywords}
                  onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                  className="mt-1"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
