'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Living Room', href: '/shop?category=living-room' },
    { label: 'Kitchen', href: '/shop?category=kitchen-decor' },
    { label: 'Wall Art', href: '/shop?category=wall-art' },
    { label: 'Gifts', href: '/shop?category=gifts' },
  ],
  company: [
    { label: 'About Us', href: '/contact' },
    { label: 'Our Story', href: '/#our-story' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Info', href: '/faq' },
    { label: 'Returns', href: '/faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  const { settings } = useSettingsStore();

  // Safe defaults
  const siteName = settings?.siteName || 'The Nireeti Nest';
  const logoUrl = settings?.logoUrl || '';
  const footerBgColor = settings?.footerBgColor || '#111827';
  const footerTextColor = settings?.footerTextColor || '#D1D5DB';
  const footerAccentColor = settings?.footerAccentColor || '#D97706';
  const contactEmail = settings?.contactEmail || 'support@thenireetinest.com';
  const contactPhone = settings?.contactPhone || '+1 234 567 8900';
  const address = settings?.address || '123 Decor Street, Design City';
  const footerText = settings?.footerText || '© 2024 The Nireeti Nest. All rights reserved.';
  const socialFacebook = settings?.socialFacebook || '';
  const socialInstagram = settings?.socialInstagram || '';
  const socialTwitter = settings?.socialTwitter || '';
  const upiEnabled = settings?.upiEnabled || false;
  const upiId = settings?.upiId || '';
  const razorpayEnabled = settings?.razorpayEnabled || false;
  const paypalEnabled = settings?.paypalEnabled || false;

  return (
    <footer style={{ backgroundColor: footerBgColor, color: footerTextColor }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: footerAccentColor }}
                >
                  <span className="text-white font-bold text-xl">
                    {siteName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-white">{siteName}</span>
            </Link>
            <p className="text-sm mb-6 max-w-sm" style={{ color: footerTextColor, opacity: 0.8 }}>
              Transform your living spaces with our curated collection of premium home decor items.
              Quality craftsmanship meets timeless design.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" style={{ color: footerAccentColor }} />
                <span className="text-sm">{contactEmail}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" style={{ color: footerAccentColor }} />
                <span className="text-sm">{contactPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" style={{ color: footerAccentColor }} />
                <span className="text-sm">{address}</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: footerTextColor, opacity: 0.8 }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: footerTextColor, opacity: 0.8 }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: footerTextColor, opacity: 0.8 }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        {(upiEnabled || razorpayEnabled || paypalEnabled) && (
          <div className="mt-10 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" style={{ color: footerAccentColor }} />
                <span className="text-white font-medium">We Accept:</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {upiEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-green-400 font-bold text-sm">UPI</span>
                    {upiId && (
                      <span className="text-xs" style={{ color: footerTextColor, opacity: 0.7 }}>
                        ({upiId})
                      </span>
                    )}
                  </div>
                )}
                {razorpayEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-blue-400 font-bold text-sm">Razorpay</span>
                  </div>
                )}
                {paypalEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-yellow-400 font-bold text-sm">PayPal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm" style={{ color: footerTextColor, opacity: 0.6 }}>
              {footerText}
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialFacebook && (
                <a
                  href={socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialInstagram && (
                <a
                  href={socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialTwitter && (
                <a
                  href={socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs hover:underline transition-colors"
                  style={{ color: footerTextColor, opacity: 0.5 }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
