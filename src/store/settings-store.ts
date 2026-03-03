'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SiteSettings {
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

interface SettingsStore {
  settings: SiteSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  applyTheme: () => void;
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

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: true,

      fetchSettings: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch('/api/settings');
          const data = await res.json();

          if (data) {
            const newSettings: SiteSettings = {
              siteName: data.siteName || defaultSettings.siteName,
              siteTagline: data.siteTagline || defaultSettings.siteTagline,
              primaryColor: data.primaryColor || defaultSettings.primaryColor,
              secondaryColor: data.secondaryColor || defaultSettings.secondaryColor,
              accentColor: data.accentColor || defaultSettings.accentColor,
              backgroundColor: data.backgroundColor || defaultSettings.backgroundColor,
              textColor: data.textColor || defaultSettings.textColor,
              logoUrl: data.logoUrl || '',
              faviconUrl: data.faviconUrl || defaultSettings.faviconUrl,
              footerBgColor: data.footerBgColor || defaultSettings.footerBgColor,
              footerTextColor: data.footerTextColor || defaultSettings.footerTextColor,
              footerAccentColor: data.footerAccentColor || defaultSettings.footerAccentColor,
              footerText: data.footerText || defaultSettings.footerText,
              contactEmail: data.contactEmail || defaultSettings.contactEmail,
              contactPhone: data.contactPhone || defaultSettings.contactPhone,
              address: data.address || defaultSettings.address,
              socialFacebook: data.socialFacebook || '',
              socialInstagram: data.socialInstagram || '',
              socialTwitter: data.socialTwitter || '',
              socialPinterest: data.socialPinterest || '',
              metaTitle: data.metaTitle || defaultSettings.metaTitle,
              metaDescription: data.metaDescription || defaultSettings.metaDescription,
              metaKeywords: data.metaKeywords || defaultSettings.metaKeywords,
              upiEnabled: data.upiEnabled === true || data.upiEnabled === 'true',
              upiId: data.upiId || '',
              upiPayeeName: data.upiPayeeName || '',
              razorpayEnabled: data.razorpayEnabled === true || data.razorpayEnabled === 'true',
              razorpayKeyId: data.razorpayKeyId || '',
              razorpayKeySecret: data.razorpayKeySecret || '',
              paypalEnabled: data.paypalEnabled === true || data.paypalEnabled === 'true',
              paypalClientId: data.paypalClientId || '',
              paypalSecret: data.paypalSecret || '',
              paypalMode: data.paypalMode || 'sandbox',
              showTestimonials: data.showTestimonials !== false && data.showTestimonials !== 'false',
              showNewsletter: data.showNewsletter !== false && data.showNewsletter !== 'false',
              showOurStory: data.showOurStory !== false && data.showOurStory !== 'false',
              ourStoryTitle: data.ourStoryTitle || defaultSettings.ourStoryTitle,
              ourStorySubtitle: data.ourStorySubtitle || defaultSettings.ourStorySubtitle,
              ourStoryDescription1: data.ourStoryDescription1 || defaultSettings.ourStoryDescription1,
              ourStoryDescription2: data.ourStoryDescription2 || defaultSettings.ourStoryDescription2,
              ourStoryImage1: data.ourStoryImage1 || '',
              ourStoryImage2: data.ourStoryImage2 || '',
              ourStoryImage3: data.ourStoryImage3 || '',
              ourStoryImage4: data.ourStoryImage4 || '',
              feature1Title: data.feature1Title || defaultSettings.feature1Title,
              feature1Description: data.feature1Description || defaultSettings.feature1Description,
              feature2Title: data.feature2Title || defaultSettings.feature2Title,
              feature2Description: data.feature2Description || defaultSettings.feature2Description,
              feature3Title: data.feature3Title || defaultSettings.feature3Title,
              feature3Description: data.feature3Description || defaultSettings.feature3Description,
              feature4Title: data.feature4Title || defaultSettings.feature4Title,
              feature4Description: data.feature4Description || defaultSettings.feature4Description,
            };

            set({ settings: newSettings, isLoading: false });
            get().applyTheme();
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          set({ isLoading: false });
        }
      },

      applyTheme: () => {
        const { settings } = get();
        if (typeof window !== 'undefined') {
          const root = document.documentElement;

          // Apply colors as CSS custom properties (hex format for broader compatibility)
          root.style.setProperty('--color-primary', settings.primaryColor);
          root.style.setProperty('--color-secondary', settings.secondaryColor);
          root.style.setProperty('--color-accent', settings.accentColor);
          root.style.setProperty('--color-bg', settings.backgroundColor);
          root.style.setProperty('--color-text', settings.textColor);
          root.style.setProperty('--color-footer-bg', settings.footerBgColor);
          root.style.setProperty('--color-footer-text', settings.footerTextColor);
          root.style.setProperty('--color-footer-accent', settings.footerAccentColor);

          // Apply to Tailwind CSS variables
          root.style.setProperty('--primary', settings.primaryColor);
          root.style.setProperty('--secondary', settings.secondaryColor);
          root.style.setProperty('--accent', settings.accentColor);
          root.style.setProperty('--background', settings.backgroundColor);
          root.style.setProperty('--foreground', settings.textColor);

          // Set sidebar colors
          root.style.setProperty('--sidebar-primary', settings.primaryColor);
          root.style.setProperty('--sidebar-ring', settings.primaryColor);

          // Apply body background
          document.body.style.backgroundColor = settings.backgroundColor;
          document.body.style.color = settings.textColor;
        }
      },
    }),
    {
      name: 'homedecor-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
