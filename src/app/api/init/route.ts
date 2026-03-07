import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET /api/init - Initialize database with sample data
export async function GET() {
  const results: string[] = [];
  
  try {
    if (!db) {
      return NextResponse.json({
        error: 'Database not configured',
        message: 'Please set DATABASE_URL environment variable',
        demoMode: true,
        adminEmail: 'admin@thenireetinest.com',
        adminPassword: 'Admin@123456',
      });
    }

    // 1. Create Admin User
    const adminEmail = 'admin@thenireetinest.com';
    const adminPassword = 'Admin@123456';
    
    try {
      const existingAdmin = await db.user.findUnique({
        where: { email: adminEmail }
      });

      if (!existingAdmin) {
        const hashedPassword = await hashPassword(adminPassword);
        await db.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin',
            role: 'ADMIN',
          }
        });
        results.push('Admin user created');
      } else {
        results.push('Admin user already exists');
      }
    } catch (e) {
      results.push(`Admin: ${e instanceof Error ? e.message : 'error'}`);
    }

    // 2. Create Categories
    const categories = [
      { name: 'Living Room', slug: 'living-room', description: 'Transform your living space' },
      { name: 'Kitchen Decor', slug: 'kitchen-decor', description: 'Beautiful kitchen essentials' },
      { name: 'Wall Art', slug: 'wall-art', description: 'Stunning wall pieces' },
      { name: 'Spiritual', slug: 'spiritual', description: 'Sacred items for your prayer space' },
      { name: 'Garden', slug: 'garden', description: 'Green essentials' },
      { name: 'Fragrances', slug: 'fragrances', description: 'Aromatic candles and incense' },
      { name: 'Floor Decor', slug: 'floor-decor', description: 'Rugs and floor coverings' },
      { name: 'Gifts', slug: 'gifts', description: 'Thoughtful gifts' },
    ];

    try {
      for (const cat of categories) {
        const existing = await db.category.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
          await db.category.create({ data: cat });
        }
      }
      results.push('Categories created');
    } catch (e) {
      results.push(`Categories: ${e instanceof Error ? e.message : 'error'}`);
    }

    // 3. Create Banners
    const banners = [
      { title: 'Welcome to The Nireeti Nest', subtitle: 'Premium Home Decor & Lifestyle', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920', link: '/shop', order: 1, isActive: true },
      { title: 'Handcrafted with Love', subtitle: 'Each piece tells a unique story', image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=1920', link: '/shop', order: 2, isActive: true },
    ];

    try {
      for (const banner of banners) {
        const existing = await db.banner.findFirst({ where: { title: banner.title } });
        if (!existing) {
          await db.banner.create({ data: banner });
        }
      }
      results.push('Banners created');
    } catch (e) {
      results.push(`Banners: ${e instanceof Error ? e.message : 'error'}`);
    }

    // 4. Create Products
    const livingCategory = await db.category.findUnique({ where: { slug: 'living-room' } });
    const wallCategory = await db.category.findUnique({ where: { slug: 'wall-art' } });
    
    const products = [
      {
        name: 'Handcrafted Cotton Throw',
        slug: 'handcrafted-cotton-throw',
        description: 'Beautiful handwoven cotton throw blanket for your living room.',
        price: 2499,
        comparePrice: 2999,
        images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600']),
        categoryId: livingCategory?.id || '1',
        stock: 50,
        featured: true,
        bestSeller: true,
        isNew: true,
      },
      {
        name: 'Macrame Wall Hanging',
        slug: 'macrame-wall-hanging',
        description: 'Beautiful handmade macrame wall art for boho decor.',
        price: 1799,
        comparePrice: 2199,
        images: JSON.stringify(['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600']),
        categoryId: wallCategory?.id || '3',
        stock: 30,
        featured: true,
        bestSeller: false,
        isNew: true,
      },
      {
        name: 'Ceramic Vase Set',
        slug: 'ceramic-vase-set',
        description: 'Elegant ceramic vase set for modern home decor.',
        price: 1899,
        comparePrice: 2299,
        images: JSON.stringify(['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600']),
        categoryId: livingCategory?.id || '1',
        stock: 25,
        featured: false,
        bestSeller: true,
        isNew: false,
      },
    ];

    try {
      for (const prod of products) {
        const existing = await db.product.findUnique({ where: { slug: prod.slug } });
        if (!existing) {
          await db.product.create({ data: prod });
        }
      }
      results.push('Products created');
    } catch (e) {
      results.push(`Products: ${e instanceof Error ? e.message : 'error'}`);
    }

    // 5. Create Testimonials
    const testimonials = [
      { name: 'Priya Sharma', role: 'Interior Designer', company: 'Mumbai', content: 'Beautiful products! The quality is amazing.', rating: 5, isFeatured: true, isActive: true },
      { name: 'Rahul Mehta', role: 'Homeowner', company: 'Delhi', content: 'Love the handcrafted items. Will definitely shop again!', rating: 5, isFeatured: true, isActive: true },
    ];

    try {
      for (const testi of testimonials) {
        const existing = await db.testimonial.findFirst({ where: { name: testi.name } });
        if (!existing) {
          await db.testimonial.create({ data: testi });
        }
      }
      results.push('Testimonials created');
    } catch (e) {
      results.push(`Testimonials: ${e instanceof Error ? e.message : 'error'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      results,
      adminCredentials: {
        email: adminEmail,
        password: adminPassword,
      },
    });

  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
