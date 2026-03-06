import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Same secret as in auth.ts
const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || 'nireeti-nest-super-secret-key-2024-production';

// Same hash function as in auth.ts
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + TOKEN_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // ==========================================
  // 1. CREATE ADMIN USER FIRST
  // ==========================================
  const adminEmail = 'admin@thenireetinest.com';
  const adminPassword = 'Admin@123456';
  const hashedPassword = await hashPassword(adminPassword);

  console.log('👤 Creating admin user...');
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}`);
  console.log(`   🔑 Password: ${adminPassword}`);

  // ==========================================
  // 2. CREATE CATEGORIES
  // ==========================================
  const categories = [
    { name: 'Living Room', slug: 'living-room', description: 'Transform your living space with our curated collection', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    { name: 'Kitchen Decor', slug: 'kitchen-decor', description: 'Beautiful handcrafted kitchen essentials', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
    { name: 'Wall Art', slug: 'wall-art', description: 'Stunning wall pieces that tell a story', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400' },
    { name: 'Spiritual', slug: 'spiritual', description: 'Sacred items for your prayer space', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400' },
    { name: 'Garden', slug: 'garden', description: 'Green essentials for your garden', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
    { name: 'Fragrances', slug: 'fragrances', description: 'Aromatic candles and incense', image: 'https://images.unsplash.com/photo-1602607615394-85f1e7fb8394?w=400' },
    { name: 'Floor Decor', slug: 'floor-decor', description: 'Rugs, dhurries and floor coverings', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400' },
    { name: 'Gifts', slug: 'gifts', description: 'Thoughtful gifts for loved ones', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400' },
  ];

  console.log('\n📁 Creating categories...');
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`   ✅ ${cat.name}`);
    } else {
      console.log(`   ⏭️  ${cat.name} (exists)`);
    }
  }

  // ==========================================
  // 3. CREATE BANNERS
  // ==========================================
  const banners = [
    { title: 'New Collection 2024', subtitle: 'Discover our latest handcrafted pieces', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920', link: '/shop', order: 1 },
    { title: 'Diwali Special', subtitle: 'Up to 30% off on festive collection', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1920', link: '/shop', order: 2 },
    { title: 'Handcrafted with Love', subtitle: 'Each piece tells a unique story', image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=1920', link: '/shop', order: 3 },
  ];

  console.log('\n🖼️ Creating banners...');
  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
    if (!existing) {
      await prisma.banner.create({ data: { ...banner, isActive: true } });
      console.log(`   ✅ ${banner.title}`);
    } else {
      console.log(`   ⏭️  ${banner.title} (exists)`);
    }
  }

  // ==========================================
  // 4. CREATE TESTIMONIALS
  // ==========================================
  const testimonials = [
    { name: 'Priya Sharma', role: 'Interior Designer', company: 'Mumbai', content: 'Beautiful products! The quality is amazing and delivery was quick. Highly recommend The Nireeti Nest for authentic home decor.', rating: 5, isFeatured: true },
    { name: 'Rahul Mehta', role: 'Homeowner', company: 'Delhi', content: 'Love the handcrafted items. Each piece tells a story. Will definitely shop again!', rating: 5, isFeatured: true },
    { name: 'Anjali Patel', role: 'Business Owner', company: 'Bangalore', content: 'Perfect gifts for housewarming. The packaging was beautiful and products are top-notch.', rating: 5, isFeatured: true },
  ];

  console.log('\n💬 Creating testimonials...');
  for (const testi of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: testi.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...testi, isActive: true } });
      console.log(`   ✅ ${testi.name}`);
    } else {
      console.log(`   ⏭️  ${testi.name} (exists)`);
    }
  }

  // ==========================================
  // 5. CREATE SAMPLE PRODUCTS
  // ==========================================
  const livingRoomCategory = await prisma.category.findUnique({ where: { slug: 'living-room' } });

  if (livingRoomCategory) {
    const products = [
      { name: 'Handcrafted Cotton Throw', slug: 'handcrafted-cotton-throw', description: 'Beautiful handwoven cotton throw blanket for your living room. Made by skilled artisans using traditional techniques.', price: 2499, comparePrice: 2999, images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'], stock: 50, featured: true, bestSeller: true },
      { name: 'Macrame Wall Hanging', slug: 'macrame-wall-hanging', description: 'Beautiful handmade macrame wall art for boho decor. Crafted with premium cotton cord.', price: 1799, comparePrice: 2199, images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600'], stock: 30, featured: true },
      { name: 'Ceramic Vase Set', slug: 'ceramic-vase-set', description: 'Elegant ceramic vase set for modern home decor. Set of 3 vases in complementary sizes.', price: 1899, comparePrice: 2299, images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600'], stock: 25, bestSeller: true },
    ];

    console.log('\n🛍️ Creating sample products...');
    for (const prod of products) {
      const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
      if (!existing) {
        await prisma.product.create({
          data: {
            ...prod,
            categoryId: livingRoomCategory.id,
            images: JSON.stringify(prod.images),
            isNew: true,
          }
        });
        console.log(`   ✅ ${prod.name}`);
      } else {
        console.log(`   ⏭️  ${prod.name} (exists)`);
      }
    }
  }

  // ==========================================
  // 6. CREATE SITE SETTINGS
  // ==========================================
  const settings = [
    { key: 'site_name', value: 'The Nireeti Nest', type: 'text', group: 'general', description: 'Website name' },
    { key: 'site_tagline', value: 'Premium Home Decor & Lifestyle', type: 'text', group: 'general', description: 'Site tagline' },
    { key: 'primary_color', value: '#b45309', type: 'color', group: 'appearance', description: 'Primary brand color' },
    { key: 'currency', value: 'INR', type: 'text', group: 'store', description: 'Currency code' },
    { key: 'free_shipping_threshold', value: '999', type: 'number', group: 'shipping', description: 'Free shipping above this amount' },
  ];

  console.log('\n⚙️ Creating site settings...');
  for (const setting of settings) {
    const existing = await prisma.siteSetting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.siteSetting.create({ data: setting });
      console.log(`   ✅ ${setting.key}`);
    } else {
      console.log(`   ⏭️  ${setting.key} (exists)`);
    }
  }

  // ==========================================
  // 7. CREATE FAQ
  // ==========================================
  const faqs = [
    { question: 'What is your return policy?', answer: 'We offer a 7-day return policy for all unused items in original packaging. Please contact us within 7 days of delivery.', category: 'Shipping & Returns', order: 1 },
    { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is available for select locations at an additional cost.', category: 'Shipping & Returns', order: 2 },
    { question: 'Do you ship internationally?', answer: 'Currently, we only ship within India. International shipping will be available soon!', category: 'Shipping & Returns', order: 3 },
    { question: 'Are your products handmade?', answer: 'Yes! Most of our products are handcrafted by skilled artisans across India, making each piece unique.', category: 'Products', order: 4 },
    { question: 'How do I track my order?', answer: 'Once your order ships, you will receive an email with tracking information. You can also track your order from your account.', category: 'Orders', order: 5 },
  ];

  console.log('\n❓ Creating FAQs...');
  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: { ...faq, isActive: true } });
      console.log(`   ✅ ${faq.question.substring(0, 30)}...`);
    } else {
      console.log(`   ⏭️  FAQ exists`);
    }
  }

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📝 Admin Login Credentials:');
  console.log('   Email: admin@thenireetinest.com');
  console.log('   Password: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
