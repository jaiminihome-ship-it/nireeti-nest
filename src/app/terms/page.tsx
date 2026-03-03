'use client';

import { useState, useEffect } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageContent {
  title: string;
  content: string;
  lastUpdated: string;
}

export default function TermsPage() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings?key=terms_page')
      .then((res) => res.json())
      .then((data) => {
        if (data.value) {
          try {
            setContent(JSON.parse(data.value));
          } catch {
            // Use default content
            setContent(null);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const defaultContent: PageContent = {
    title: 'Terms & Conditions',
    content: `
## 1. Introduction

Welcome to HomeDecor. These terms and conditions govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms.

## 2. Definitions

- **"Website"** refers to HomeDecor's online store
- **"Services"** refers to any services provided by HomeDecor
- **"Products"** refers to any goods available for purchase on our website
- **"User"** refers to any individual who accesses or uses the website

## 3. Use of Website

You must be at least 18 years old to make a purchase on our website. By using our website, you warrant that you are at least 18 years of age and legally capable of entering into binding contracts.

## 4. Products and Pricing

All product descriptions, images, and prices are subject to change without notice. We reserve the right to:
- Modify or discontinue any product
- Change prices at any time
- Limit the quantity of products available for purchase

## 5. Orders and Payment

When you place an order through our website:
- You warrant that you are legally capable of entering into binding contracts
- Your order constitutes an offer to purchase products
- We reserve the right to refuse any order for any reason

Payment must be received prior to acceptance of an order. We accept major credit cards, debit cards, and other payment methods as indicated on our website.

## 6. Shipping and Delivery

Delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by:
- Customs processing
- Weather conditions
- Carrier delays
- Incorrect shipping addresses

## 7. Returns and Refunds

Please refer to our Returns Policy for detailed information about returns and refunds. Generally:
- Items must be returned within 30 days of delivery
- Items must be unused and in original packaging
- Certain items may not be eligible for return

## 8. Intellectual Property

All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of HomeDecor and is protected by copyright and trademark laws.

## 9. Privacy

Your use of our website is also governed by our Privacy Policy. By using our website, you consent to the collection and use of your information as described in our Privacy Policy.

## 10. Limitation of Liability

To the fullest extent permitted by law, HomeDecor shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our website or products.

## 11. Governing Law

These terms and conditions are governed by and construed in accordance with applicable laws. Any disputes shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.

## 12. Changes to Terms

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following any changes constitutes acceptance of those changes.

## 13. Contact Information

For questions about these Terms & Conditions, please contact us at:
- Email: support@homedecor.com
- Phone: 1-800-HOME-DECOR
- Address: 123 Decor Street, Design City, DC 12345
    `,
    lastUpdated: new Date().toISOString(),
  };

  const displayContent = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{displayContent.title}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
            <FileText className="h-10 w-10" />
            {displayContent.title}
          </h1>
          <p className="mt-2 text-amber-100">
            Last updated: {new Date(displayContent.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
                <p className="mt-4 text-gray-500">Loading...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 md:p-12">
                <div className="prose prose-amber max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-amber-600">
                  {displayContent.content.split('\n').map((line, index) => {
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
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-8 bg-amber-50 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
            <Link href="/faq">
              <Button variant="outline">View FAQ</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
