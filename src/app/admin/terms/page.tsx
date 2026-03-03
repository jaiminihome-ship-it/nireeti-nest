'use client';

import { useState, useEffect } from 'react';
import { Save, FileText, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTermsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    title: 'Terms & Conditions',
    content: '',
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings?key=terms_page');
      const data = await res.json();
      if (data.value) {
        try {
          const parsed = JSON.parse(data.value);
          setContent(parsed);
        } catch {
          // Use default content
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedContent = {
        ...content,
        lastUpdated: new Date().toISOString(),
      };
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'terms_page',
          value: JSON.stringify(updatedContent),
          type: 'json',
          group: 'pages',
        }),
      });

      if (res.ok) {
        setContent(updatedContent);
        alert('Terms page saved successfully!');
      } else {
        alert('Failed to save terms page');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save terms page');
    } finally {
      setSaving(false);
    }
  };

  const defaultContent = `## 1. Introduction

Welcome to HomeDecor. These terms and conditions govern your use of our website and services.

## 2. Definitions

- **"Website"** refers to HomeDecor's online store
- **"Services"** refers to any services provided by HomeDecor
- **"Products"** refers to any goods available for purchase

## 3. Use of Website

You must be at least 18 years old to make a purchase on our website.

## 4. Products and Pricing

All product descriptions, images, and prices are subject to change without notice.

## 5. Orders and Payment

When you place an order through our website, you warrant that you are legally capable of entering into binding contracts.

## 6. Shipping and Delivery

Delivery times are estimates only and are not guaranteed.

## 7. Returns and Refunds

Items must be returned within 30 days of delivery in unused condition and original packaging.

## 8. Contact Information

For questions about these Terms & Conditions, please contact us at support@homedecor.com`;

  const previewContent = content.content || defaultContent;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-600">Edit your terms and conditions page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="edit">Edit Content</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Terms Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Page Title</Label>
                <Input
                  value={content.title}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Content (Markdown format)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Use ## for headings, - for bullet points, **text** for bold
                </p>
                <Textarea
                  value={content.content || defaultContent}
                  onChange={(e) => setContent({ ...content, content: e.target.value })}
                  className="mt-1 font-mono min-h-[500px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-amber max-w-none prose-headings:text-gray-900 prose-p:text-gray-600">
                {previewContent.split('\n').map((line, index) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  } else if (line.startsWith('### ')) {
                    return (
                      <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  } else if (line.startsWith('- ')) {
                    return (
                      <li key={index} className="ml-6 text-gray-600">
                        {line.replace('- ', '')}
                      </li>
                    );
                  } else if (line.trim()) {
                    return (
                      <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
