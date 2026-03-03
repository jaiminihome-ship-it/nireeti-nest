'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  // Don't render anything if no categories - admin controls content
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections designed to transform every corner of your home
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* 3D Glass Effect */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 backdrop-blur-[2px] transition-all duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-gray-200 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center font-medium group-hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* 3D Shadow Effect */}
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
