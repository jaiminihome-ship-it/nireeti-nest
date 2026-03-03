// ==========================================
// Types for HomeDecor eCommerce Application
// ==========================================

// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  phone: string | null;
  address: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFormData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  videos: string[];
  categoryId: string;
  category?: Category;
  stock: number;
  sku: string | null;
  featured: boolean;
  bestSeller: boolean;
  guarantee: string | null;
  warranty: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
  offers?: Offer[];
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  videos?: string[];
  categoryId: string;
  stock: number;
  sku?: string;
  featured?: boolean;
  bestSeller?: boolean;
  guarantee?: string;
  warranty?: string;
  tags?: string;
}

// Order Types
export interface Order {
  id: string;
  userId: string | null;
  user?: User | null;
  total: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddr: string | null;
  billingAddr: string | null;
  couponCode: string | null;
  discount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddr?: string;
  billingAddr?: string;
  couponCode?: string;
  notes?: string;
}

// Offer Types
export interface Offer {
  id: string;
  title: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  productId: string | null;
  product?: Product | null;
  categoryId: string | null;
  isActive: boolean;
  bannerImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferFormData {
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  productId?: string;
  categoryId?: string;
  isActive?: boolean;
  bannerImage?: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  expiryDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponFormData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxUses?: number;
  expiryDate?: Date;
  isActive?: boolean;
}

export interface CouponValidation {
  valid: boolean;
  message: string;
  discount: number;
  coupon?: Coupon;
}

// Gift Order Types
export interface GiftOrder {
  id: string;
  senderId: string;
  sender?: User;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  message: string | null;
  deliveryDate: Date | null;
  giftWrap: boolean;
  giftWrapPrice: number;
  isAnonymous: boolean;
  productId: string;
  product?: Product;
  quantity: number;
  total: number;
  status: GiftOrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type GiftOrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface GiftOrderFormData {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  message?: string;
  deliveryDate?: Date;
  giftWrap?: boolean;
  isAnonymous?: boolean;
  productId: string;
  quantity: number;
}

// Banner Types
export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerFormData {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar: string | null;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestimonialFormData {
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  rating: number;
  isActive?: boolean;
}

// Site Settings Types
export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  footerText: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
  };
  contactEmail: string;
  contactPhone: string;
  address: string;
}

// Cart Types (for Zustand store)
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount: number;
  couponCode: string | null;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeOffers: number;
  activeCoupons: number;
  recentOrders: Order[];
  topProducts: Product[];
}
