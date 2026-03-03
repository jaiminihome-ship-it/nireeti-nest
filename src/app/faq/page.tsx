'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Search, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
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

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/faq?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = searchQuery
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                size="sm"
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveCategory('all')}
                className={activeCategory === 'all' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                All
              </Button>
              {FAQ_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={activeCategory === category ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(category)}
                  className={activeCategory === category ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
                <p className="mt-4 text-gray-500">Loading FAQs...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Check back later for frequently asked questions'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                  <div key={category}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {category}
                      </Badge>
                      <span>{categoryFaqs.length} questions</span>
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                      <Accordion type="single" collapsible className="w-full">
                        {categoryFaqs.map((faq, index) => (
                          <AccordionItem
                            key={faq.id}
                            value={faq.id}
                            className={index > 0 ? 'border-t' : ''}
                          >
                            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-amber-50/50">
                              <span className="font-medium">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Please reach out to our support team.
          </p>
          <Link href="/contact">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
