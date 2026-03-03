'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

interface FooterSettings {
  siteName: string;
  logoUrl: string;
  footerBgColor: string;
  footerTextColor: string;
  footerAccentColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  footerText: string;
  // Payment methods
  upiEnabled: boolean;
  upiId: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  paypalEnabled: boolean;
  paypalClientId: string;
}

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Living Room', href: '/shop?category=living-room' },
    { label: 'Bedroom', href: '/shop?category=bedroom' },
    { label: 'Kitchen', href: '/shop?category=kitchen' },
    { label: 'Outdoor', href: '/shop?category=outdoor' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/about#story' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Track Order', href: '/track-order' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>({
    siteName: 'The Nireeti Nest',
    logoUrl: '',
    footerBgColor: '#111827',
    footerTextColor: '#D1D5DB',
    footerAccentColor: '#D97706',
    contactEmail: 'support@thenireetinest.com',
    contactPhone: '+1 234 567 8900',
    address: '123 Decor Street, Design City',
    socialFacebook: '',
    socialInstagram: '',
    socialTwitter: '',
    footerText: '© 2024 The Nireeti Nest. All rights reserved.',
    upiEnabled: false,
    upiId: '',
    razorpayEnabled: false,
    razorpayKeyId: '',
    paypalEnabled: false,
    paypalClientId: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            siteName: data.siteName || 'The Nireeti Nest',
            logoUrl: data.logoUrl || '',
            footerBgColor: data.footerBgColor || '#111827',
            footerTextColor: data.footerTextColor || '#D1D5DB',
            footerAccentColor: data.footerAccentColor || '#D97706',
            contactEmail: data.contactEmail || 'support@thenireetinest.com',
            contactPhone: data.contactPhone || '+1 234 567 8900',
            address: data.address || '123 Decor Street, Design City',
            socialFacebook: data.socialFacebook || '',
            socialInstagram: data.socialInstagram || '',
            socialTwitter: data.socialTwitter || '',
            footerText: data.footerText || '© 2024 The Nireeti Nest. All rights reserved.',
            upiEnabled: data.upiEnabled === true,
            upiId: data.upiId || '',
            razorpayEnabled: data.razorpayEnabled === true,
            razorpayKeyId: data.razorpayKeyId || '',
            paypalEnabled: data.paypalEnabled === true,
            paypalClientId: data.paypalClientId || '',
          });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer style={{ backgroundColor: settings.footerBgColor, color: settings.footerTextColor }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: settings.footerAccentColor }}
                >
                  <span className="text-white font-bold text-xl">
                    {settings.siteName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-white">{settings.siteName}</span>
            </Link>
            <p className="text-sm mb-6 max-w-sm" style={{ color: settings.footerTextColor, opacity: 0.8 }}>
              Transform your living spaces with our curated collection of premium home decor items. 
              Quality craftsmanship meets timeless design.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" style={{ color: settings.footerAccentColor }} />
                <span className="text-sm">{settings.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" style={{ color: settings.footerAccentColor }} />
                <span className="text-sm">{settings.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" style={{ color: settings.footerAccentColor }} />
                <span className="text-sm">{settings.address}</span>
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
                    style={{ color: settings.footerTextColor, opacity: 0.8 }}
                    onMouseOver={(e) => e.currentTarget.style.color = settings.footerAccentColor}
                    onMouseOut={(e) => e.currentTarget.style.color = settings.footerTextColor}
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
                    style={{ color: settings.footerTextColor, opacity: 0.8 }}
                    onMouseOver={(e) => e.currentTarget.style.color = settings.footerAccentColor}
                    onMouseOut={(e) => e.currentTarget.style.color = settings.footerTextColor}
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
                    style={{ color: settings.footerTextColor, opacity: 0.8 }}
                    onMouseOver={(e) => e.currentTarget.style.color = settings.footerAccentColor}
                    onMouseOut={(e) => e.currentTarget.style.color = settings.footerTextColor}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        {(settings.upiEnabled || settings.razorpayEnabled || settings.paypalEnabled) && (
          <div className="mt-10 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" style={{ color: settings.footerAccentColor }} />
                <span className="text-white font-medium">We Accept:</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {settings.upiEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-green-400 font-bold text-sm">UPI</span>
                    {settings.upiId && (
                      <span className="text-xs" style={{ color: settings.footerTextColor, opacity: 0.7 }}>
                        ({settings.upiId})
                      </span>
                    )}
                  </div>
                )}
                {settings.razorpayEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-blue-400 font-bold text-sm">Razorpay</span>
                  </div>
                )}
                {settings.paypalEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-yellow-400 font-bold text-sm">PayPal</span>
                  </div>
                )}
                {/* Credit/Debit Cards */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-xs" style={{ color: settings.footerTextColor }}>Visa / Mastercard / Amex</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm" style={{ color: settings.footerTextColor, opacity: 0.6 }}>
              {settings.footerText}
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = settings.footerAccentColor}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = settings.footerAccentColor}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.socialTwitter && (
                <a
                  href={settings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = settings.footerAccentColor}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
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
                  style={{ color: settings.footerTextColor, opacity: 0.5 }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
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
