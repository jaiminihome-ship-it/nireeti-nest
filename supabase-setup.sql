-- Run this in Supabase SQL Editor after deployment
-- This creates all required tables

-- Users Table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'USER',
    phone TEXT,
    address TEXT,
    avatar TEXT,
    otp TEXT,
    "otpExpiry" TIMESTAMP,
    "resetToken" TEXT,
    "resetExpiry" TIMESTAMP,
    "emailVerified" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS "Category" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS "Product" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    "shortDesc" TEXT,
    price DOUBLE PRECISION NOT NULL,
    "comparePrice" DOUBLE PRECISION,
    images TEXT DEFAULT '[]',
    videos TEXT,
    "categoryId" TEXT NOT NULL REFERENCES "Category"(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    barcode TEXT,
    featured BOOLEAN DEFAULT false,
    "bestSeller" BOOLEAN DEFAULT false,
    "isNew" BOOLEAN DEFAULT false,
    guarantee TEXT,
    warranty TEXT,
    "returnPolicy" TEXT,
    "deliveryTime" TEXT,
    "deliveryCost" DOUBLE PRECISION DEFAULT 0,
    material TEXT,
    dimensions TEXT,
    weight TEXT,
    color TEXT,
    style TEXT,
    assembly TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    tags TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS "SiteSetting" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'text',
    group TEXT,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Banners Table
CREATE TABLE IF NOT EXISTS "Banner" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image TEXT NOT NULL,
    "mobileImage" TEXT,
    link TEXT,
    "buttonText" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS "Testimonial" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    content TEXT NOT NULL,
    avatar TEXT,
    rating INTEGER DEFAULT 5,
    "productId" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "isFeatured" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber" TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    total DOUBLE PRECISION NOT NULL,
    subtotal DOUBLE PRECISION DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    "paymentStatus" TEXT DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddr" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingZip" TEXT,
    "shippingCountry" TEXT,
    "billingAddr" TEXT,
    "couponCode" TEXT,
    discount DOUBLE PRECISION DEFAULT 0,
    "deliveryCost" DOUBLE PRECISION DEFAULT 0,
    "deliveryMethod" TEXT,
    "estimatedDelivery" TIMESTAMP,
    "trackingNumber" TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS "OrderItem" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"(id),
    "productName" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    source TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO "SiteSetting" (key, value, type, "group") VALUES
('siteName', 'The Nireeti Nest', 'text', 'general'),
('siteTagline', 'Premium Home Decor', 'text', 'general'),
('siteDescription', 'Discover exquisite home decor pieces that transform your living spaces into havens of elegance and comfort.', 'text', 'general'),
('primaryColor', '#b45309', 'color', 'theme'),
('secondaryColor', '#92400e', 'color', 'theme'),
('contactEmail', 'support@thenireetinest.com', 'text', 'contact'),
('contactPhone', '+91 98765 43210', 'text', 'contact'),
('socialInstagram', 'https://instagram.com/thenireetinest', 'text', 'social'),
('socialFacebook', 'https://facebook.com/thenireetinest', 'text', 'social')
ON CONFLICT (key) DO NOTHING;
