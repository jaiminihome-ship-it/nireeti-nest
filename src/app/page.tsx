'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import BestSellersSection from '@/components/home/BestSellersSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import OurStorySection from '@/components/home/OurStorySection';
import { safeJsonParse } from '@/lib/utils';
import { useSettingsStore } from '@/store/settings-store';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { Banner, Category, Product, Testimonial } from '@/types';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const { settings } = useSettingsStore();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [bannersRes, categoriesRes, productsRes, testimonialsRes] = await Promise.all([
          fetch('/api/banners'),
          fetch('/api/categories'),
          fetch('/api/products?bestSeller=true&limit=8'),
          fetch('/api/testimonials?limit=3'),
        ]);

        const [bannersData, categoriesData, productsData, testimonialsData] = await Promise.all([
          bannersRes.json(),
          categoriesRes.json(),
          productsRes.json(),
          testimonialsRes.json(),
        ]);

        // Fix 1: Safe Array Checks for Banners & Categories [cite: 2]
        setBanners(Array.isArray(bannersData) ? bannersData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Fix 2: Robust Product Parsing (Handling both Array and Object responses) [cite: 2, 11]
        const productsArray = Array.isArray(productsData) 
          ? productsData 
          : (productsData?.data || []);

        const parsedProducts = productsArray.map((p: Product) => ({
          ...p,
          images: safeJsonParse<string[]>(p.images as unknown as string, []),
        }));
        
        setBestSellers(parsedProducts);
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterError('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'homepage' }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterSuccess(true);
        setNewsletterEmail('');
      } else {
        setNewsletterError(data.error || 'Failed to subscribe');
      }
    } catch {
      setNewsletterError('Failed to subscribe. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-amber-600"></div>
          <p className="text-gray-600">Loading Nireeti Nest...</p>
        </div>
      </div>
    );
  }

  const primaryColor = settings?.primaryColor || '#B45309';
  const secondaryColor = settings?.secondaryColor || '#D2691E';

  return (
    <div className="min-h-screen">
      <HeroSection banners={banners} />

      {/* Categories Section - Only render if data exists [cite: 9] */}
      {categories.length > 0 && <CategoriesSection categories={categories} />}

      {/* Best Sellers Section - Only render if data exists [cite: 10] */}
      {bestSellers.length > 0 && <BestSellersSection products={bestSellers} />}

      {settings?.showOurStory !== false && <OurStorySection />}

      {settings?.showTestimonials !== false && testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {settings?.showNewsletter !== false && (
        <section
          className="py-20 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-8 max-w-2xl mx-auto opacity-90">
              Be the first to know about new collections and exclusive offers.
            </p>

            {newsletterSuccess ? (
              <div className="flex flex-center gap-2 justify-center">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg">Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-8 py-3 bg-white text-gray-800 font-semibold rounded-lg disabled:opacity-50"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
}