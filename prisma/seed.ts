import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || 'nireeti-nest-super-secret-key-2024-production';

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@thenireetinest.com' },
    update: { password: hashPassword('Admin@123456'), role: 'ADMIN', name: 'Admin' },
    create: {
      email: 'admin@thenireetinest.com',
      password: hashPassword('Admin@123456'),
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin:', admin.email);

  // 2. Categories
  const categories = [
    { name: 'Living Room', slug: 'living-room', description: 'Transform your living space', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    { name: 'Kitchen Decor', slug: 'kitchen-decor', description: 'Beautiful kitchen essentials', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
    { name: 'Wall Art', slug: 'wall-art', description: 'Stunning wall pieces', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400' },
    { name: 'Spiritual', slug: 'spiritual', description: 'Sacred items for prayer space', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400' },
    { name: 'Garden', slug: 'garden', description: 'Garden essentials', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
    { name: 'Fragrances', slug: 'fragrances', description: 'Candles & incense', image: 'https://images.unsplash.com/photo-1602607615394-85f1e7fb8394?w=400' },
    { name: 'Floor Decor', slug: 'floor-decor', description: 'Rugs & dhurries', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400' },
    { name: 'Gifts', slug: 'gifts', description: 'Thoughtful gifts', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400' },
  ];

  console.log('\n📁 Categories...');
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat });
    console.log(`   ✅ ${cat.name}`);
  }

  // 3. Banners
  const banners = [
    { title: 'Welcome to The Nireeti Nest', subtitle: 'Premium Home Decor & Lifestyle', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920', link: '/shop', order: 1, isActive: true },
    { title: 'Handcrafted with Love', subtitle: 'Each piece tells a unique story', image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=1920', link: '/shop', order: 2, isActive: true },
  ];

  console.log('\n🖼️ Banners...');
  for (const b of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!existing) {
      await prisma.banner.create({ data: b });
      console.log(`   ✅ ${b.title}`);
    } else {
      console.log(`   ⏭️ ${b.title} (already exists)`);
    }
  }

  // Get category IDs
  const livingRoom = await prisma.category.findUnique({ where: { slug: 'living-room' } });
  const wallArt = await prisma.category.findUnique({ where: { slug: 'wall-art' } });
  const spiritual = await prisma.category.findUnique({ where: { slug: 'spiritual' } });
  const fragrances = await prisma.category.findUnique({ where: { slug: 'fragrances' } });
  const floorDecor = await prisma.category.findUnique({ where: { slug: 'floor-decor' } });

  // 4. Products
  const products = [
    { name: 'Handcrafted Cotton Throw', slug: 'handcrafted-cotton-throw', description: 'Beautiful handwoven cotton throw blanket.', shortDesc: 'Handwoven cotton throw', price: 2499, comparePrice: 2999, images: '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"]', categoryId: livingRoom!.id, stock: 50, featured: true, bestSeller: true, isNew: true },
    { name: 'Macrame Wall Hanging', slug: 'macrame-wall-hanging', description: 'Handmade macrame wall art.', shortDesc: 'Handmade macrame art', price: 1799, comparePrice: 2199, images: '["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600"]', categoryId: wallArt!.id, stock: 30, featured: true, bestSeller: false, isNew: true },
    { name: 'Ceramic Vase Set', slug: 'ceramic-vase-set', description: 'Elegant ceramic vase set of 3.', shortDesc: 'Set of 3 ceramic vases', price: 1899, comparePrice: 2299, images: '["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600"]', categoryId: livingRoom!.id, stock: 25, featured: false, bestSeller: true, isNew: false },
    { name: 'Brass Diya Set', slug: 'brass-diya-set', description: 'Traditional brass diya set of 6.', shortDesc: 'Traditional brass diya set', price: 899, comparePrice: 1199, images: '["https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600"]', categoryId: spiritual!.id, stock: 100, featured: true, bestSeller: true, isNew: false },
    { name: 'Scented Candle Set', slug: 'scented-candle-set', description: 'Premium scented candles set of 3.', shortDesc: 'Set of 3 scented candles', price: 1299, comparePrice: 1599, images: '["https://images.unsplash.com/photo-1602607615394-85f1e7fb8394?w=600"]', categoryId: fragrances!.id, stock: 60, featured: true, bestSeller: true, isNew: true },
    { name: 'Handwoven Dhurrie', slug: 'handwoven-dhurrie', description: 'Traditional cotton dhurrie rug.', shortDesc: 'Handwoven dhurrie rug', price: 3499, comparePrice: 4299, images: '["https://images.unsplash.com/photo-1600166898405-da9535204843?w=600"]', categoryId: floorDecor!.id, stock: 15, featured: false, bestSeller: true, isNew: false },
  ];

  console.log('\n🛍️ Products...');
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
    console.log(`   ✅ ${p.name}`);
  }

  // 5. FAQs
  const faqs = [
    { question: 'What is your return policy?', answer: 'We offer a 7-day return policy for all unused items in original packaging.', category: 'Shipping', order: 1 },
    { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days within India.', category: 'Shipping', order: 2 },
    { question: 'Are your products handmade?', answer: 'Yes! Most products are handcrafted by skilled artisans.', category: 'Products', order: 3 },
    { question: 'How do I track my order?', answer: 'You will receive tracking info via email/SMS once shipped.', category: 'Orders', order: 4 },
  ];

  console.log('\n❓ FAQs...');
  for (const f of faqs) {
    await prisma.fAQ.upsert({ where: { question: f.question }, update: f, create: { ...f, isActive: true } });
    console.log(`   ✅ ${f.question.substring(0, 30)}...`);
  }

  // 6. Coupons
  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: {}, create: { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10, minPurchase: 500 } });
  await prisma.coupon.upsert({ where: { code: 'FLAT200' }, update: {}, create: { code: 'FLAT200', discountType: 'FIXED', discountValue: 200, minPurchase: 1000 } });
  console.log('\n🎟️ Coupons created');

  // 7. Site Settings
  const settings = [
    { key: 'siteName', value: 'The Nireeti Nest' },
    { key: 'primaryColor', value: '#B45309' },
    { key: 'contactEmail', value: 'support@thenireetinest.com' },
    { key: 'contactPhone', value: '+91 98765 43210' },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: s, create: s });
  }
  console.log('\n⚙️ Settings created');

  console.log('\n✅ SEED COMPLETE!');
  console.log('\n🔐 Login: admin@thenireetinest.com / Admin@123456');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
