import { PrismaClient } from '@prisma/client';
import { hash } from 'crypto';

const prisma = new PrismaClient();

// Simple hash function for demo
async function hashPassword(password: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homedecor.com' },
    update: {},
    create: {
      email: 'admin@homedecor.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create demo user
  const userPassword = await hashPassword('demo123');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@homedecor.com' },
    update: {},
    create: {
      email: 'demo@homedecor.com',
      password: userPassword,
      name: 'Demo User',
      role: 'USER',
    },
  });
  console.log('Created demo user:', demoUser.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'living-room' },
      update: {},
      create: {
        name: 'Living Room',
        slug: 'living-room',
        description: 'Transform your living space with our curated collection',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bedroom' },
      update: {},
      create: {
        name: 'Bedroom',
        slug: 'bedroom',
        description: 'Create your perfect sanctuary',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'kitchen' },
      update: {},
      create: {
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Modern kitchen essentials',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'outdoor' },
      update: {},
      create: {
        name: 'Outdoor',
        slug: 'outdoor',
        description: 'Patio and garden furniture',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lighting' },
      update: {},
      create: {
        name: 'Lighting',
        slug: 'lighting',
        description: 'Illuminate your space beautifully',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'decor' },
      update: {},
      create: {
        name: 'Decor',
        slug: 'decor',
        description: 'Finishing touches for every room',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      },
    }),
  ]);
  console.log('Created', categories.length, 'categories');

  // Create products
  const products = [
    {
      name: 'Modern Accent Chair',
      slug: 'modern-accent-chair',
      description: 'Elegant and comfortable accent chair with solid wood frame and premium fabric upholstery. Perfect for any living room or bedroom.',
      price: 299.00,
      comparePrice: 399.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      ]),
      categoryId: categories[0].id,
      stock: 15,
      sku: 'AC-001',
      featured: true,
      bestSeller: true,
      guarantee: '2 Year Warranty',
      warranty: '5 Years',
    },
    {
      name: 'Marble Coffee Table',
      slug: 'marble-coffee-table',
      description: 'Stunning marble top coffee table with gold-finished metal legs. A statement piece for modern interiors.',
      price: 549.00,
      comparePrice: 699.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80',
      ]),
      categoryId: categories[0].id,
      stock: 8,
      sku: 'CT-002',
      featured: true,
      bestSeller: true,
      guarantee: '3 Year Warranty',
      warranty: '7 Years',
    },
    {
      name: 'Velvet Sectional Sofa',
      slug: 'velvet-sectional-sofa',
      description: 'Luxurious L-shaped velvet sectional sofa with deep seating and plush cushions. Available in multiple colors.',
      price: 1899.00,
      comparePrice: 2299.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      ]),
      categoryId: categories[0].id,
      stock: 3,
      sku: 'SS-003',
      featured: true,
      bestSeller: true,
      guarantee: '5 Year Warranty',
      warranty: '10 Years',
    },
    {
      name: 'Platform Bed Frame',
      slug: 'platform-bed-frame',
      description: 'Modern platform bed with upholstered headboard and solid wood construction. No box spring needed.',
      price: 799.00,
      comparePrice: 999.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
      ]),
      categoryId: categories[1].id,
      stock: 10,
      sku: 'BD-004',
      featured: true,
      bestSeller: false,
      guarantee: '5 Year Warranty',
      warranty: '10 Years',
    },
    {
      name: 'Minimalist Floor Lamp',
      slug: 'minimalist-floor-lamp',
      description: 'Sleek floor lamp with adjustable arm and warm LED lighting. Perfect for reading corners.',
      price: 149.00,
      comparePrice: 199.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      ]),
      categoryId: categories[4].id,
      stock: 25,
      sku: 'FL-005',
      featured: false,
      bestSeller: true,
      guarantee: '1 Year Warranty',
      warranty: '3 Years',
    },
    {
      name: 'Pendant Light Trio',
      slug: 'pendant-light-trio',
      description: 'Set of three matching pendant lights with brass finish. Perfect over kitchen islands or dining tables.',
      price: 299.00,
      comparePrice: null,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      ]),
      categoryId: categories[4].id,
      stock: 12,
      sku: 'PL-006',
      featured: false,
      bestSeller: false,
      guarantee: '2 Year Warranty',
      warranty: '5 Years',
    },
    {
      name: 'Ceramic Vase Set',
      slug: 'ceramic-vase-set',
      description: 'Set of three handcrafted ceramic vases in varying sizes. Beautiful neutral tones.',
      price: 89.00,
      comparePrice: 129.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80',
      ]),
      categoryId: categories[5].id,
      stock: 30,
      sku: 'VS-007',
      featured: true,
      bestSeller: false,
      guarantee: null,
      warranty: null,
    },
    {
      name: 'Wall Art Canvas Set',
      slug: 'wall-art-canvas-set',
      description: 'Three-piece abstract canvas art set. Modern design perfect for living rooms or offices.',
      price: 199.00,
      comparePrice: null,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800&q=80',
      ]),
      categoryId: categories[5].id,
      stock: 20,
      sku: 'WA-008',
      featured: false,
      bestSeller: true,
      guarantee: null,
      warranty: null,
    },
    {
      name: 'Kitchen Island Cart',
      slug: 'kitchen-island-cart',
      description: 'Mobile kitchen island with butcher block top, storage drawers, and wine rack.',
      price: 449.00,
      comparePrice: 599.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      ]),
      categoryId: categories[2].id,
      stock: 7,
      sku: 'KI-009',
      featured: false,
      bestSeller: false,
      guarantee: '2 Year Warranty',
      warranty: '5 Years',
    },
    {
      name: 'Patio Dining Set',
      slug: 'patio-dining-set',
      description: '6-piece outdoor dining set with weather-resistant wicker and cushions.',
      price: 1299.00,
      comparePrice: 1599.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      ]),
      categoryId: categories[3].id,
      stock: 5,
      sku: 'PD-010',
      featured: true,
      bestSeller: true,
      guarantee: '3 Year Warranty',
      warranty: '7 Years',
    },
    {
      name: 'Woven Storage Basket',
      slug: 'woven-storage-basket',
      description: 'Hand-woven storage basket with lid. Perfect for blankets or toys.',
      price: 59.00,
      comparePrice: 79.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
      ]),
      categoryId: categories[5].id,
      stock: 40,
      sku: 'SB-011',
      featured: false,
      bestSeller: false,
      guarantee: null,
      warranty: null,
    },
    {
      name: 'Dresser with Mirror',
      slug: 'dresser-with-mirror',
      description: '6-drawer dresser with matching mirror. Solid wood construction with soft-close drawers.',
      price: 699.00,
      comparePrice: 899.00,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80',
      ]),
      categoryId: categories[1].id,
      stock: 8,
      sku: 'DR-012',
      featured: false,
      bestSeller: false,
      guarantee: '5 Year Warranty',
      warranty: '10 Years',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log('Created', products.length, 'products');

  // Create banners
  const banners = [
    {
      title: 'Summer Sale 2024',
      subtitle: 'Up to 50% off on selected items',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80',
      link: '/offers',
      isActive: true,
      order: 1,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Check out our latest collection',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80',
      link: '/shop',
      isActive: true,
      order: 2,
    },
    {
      title: 'Free Shipping',
      subtitle: 'On orders over $100',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
      link: '/shop',
      isActive: true,
      order: 3,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: `banner-${banner.order}` },
      update: banner,
      create: banner,
    });
  }
  console.log('Created', banners.length, 'banners');

  // Create testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Interior Designer',
      content: 'The quality of furniture from HomeDecor is exceptional. Every piece I\'ve ordered has exceeded my expectations. The attention to detail and craftsmanship is remarkable.',
      rating: 5,
      isActive: true,
    },
    {
      name: 'Michael Chen',
      role: 'Homeowner',
      content: 'I\'ve been shopping here for years and they never disappoint. The customer service is outstanding and the products are always top-notch. Highly recommended!',
      rating: 5,
      isActive: true,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Architect',
      content: 'As an architect, I appreciate the blend of aesthetics and functionality in their products. HomeDecor has become my go-to for all my design projects.',
      rating: 5,
      isActive: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }
  console.log('Created', testimonials.length, 'testimonials');

  // Create sample coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 50,
      maxUses: 100,
      isActive: true,
    },
  });
  console.log('Created sample coupon: WELCOME10');

  // Create sample offer
  await prisma.offer.create({
    data: {
      title: 'Summer Flash Sale',
      description: 'Get 20% off on all outdoor furniture',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      categoryId: categories[3].id, // Outdoor
      isActive: true,
    },
  });
  console.log('Created sample offer');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
