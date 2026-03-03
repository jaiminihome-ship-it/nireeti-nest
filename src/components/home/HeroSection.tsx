'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { Banner } from '@/types';

interface HeroSectionProps {
  banners: Banner[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides - must be called before any early returns
  useEffect(() => {
    if (banners.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Don't render anything if no banners - admin controls content
  if (banners.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[10000ms]"
            style={{
              backgroundImage: `url(${banner.image})`,
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 transform transition-all duration-700"
                style={{
                  transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)',
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {banner.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 transform transition-all duration-700 delay-100"
                style={{
                  transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)',
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {banner.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 transform transition-all duration-700 delay-200"
                style={{
                  transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)',
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                <Link href={banner.link || '/shop'}>
                  <Button size="lg" className="text-white gap-2 shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                    Shop Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/offers">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                    View Offers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8'
                  : 'w-3 bg-white/50 hover:bg-white/70'
              }`}
              style={{
                backgroundColor: index === currentSlide ? 'var(--color-primary)' : undefined
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
