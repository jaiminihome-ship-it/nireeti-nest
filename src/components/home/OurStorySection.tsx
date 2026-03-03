'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Award, Leaf, Heart, Truck } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';

const iconMap = {
  Award,
  Leaf,
  Heart,
  Truck,
};

export default function OurStorySection() {
  const { settings } = useSettingsStore();

  // Don't render if section is hidden
  if (!settings.showOurStory) {
    return null;
  }

  const features = [
    {
      icon: Award,
      title: settings.feature1Title,
      description: settings.feature1Description,
    },
    {
      icon: Leaf,
      title: settings.feature2Title,
      description: settings.feature2Description,
    },
    {
      icon: Heart,
      title: settings.feature3Title,
      description: settings.feature3Description,
    },
    {
      icon: Truck,
      title: settings.feature4Title,
      description: settings.feature4Description,
    },
  ];

  // Default images if not set
  const image1 = settings.ourStoryImage1 || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80';
  const image2 = settings.ourStoryImage2 || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80';
  const image3 = settings.ourStoryImage3 || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';
  const image4 = settings.ourStoryImage4 || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80';

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={image1}
                    alt="Craftsmanship"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={image2}
                    alt="Interior Design"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={image3}
                    alt="Living Room"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={image4}
                    alt="Bedroom"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full opacity-50 blur-3xl" style={{ backgroundColor: settings.primaryColor }} />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {settings.ourStoryTitle}
            </h2>
            <p className="text-gray-500 mb-4 text-lg">
              {settings.ourStorySubtitle}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {settings.ourStoryDescription1}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {settings.ourStoryDescription2}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${settings.primaryColor}20` }}>
                      <Icon className="h-5 w-5" style={{ color: settings.primaryColor }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <Link href="/about">
              <Button className="text-white" style={{ backgroundColor: settings.primaryColor }}>
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
