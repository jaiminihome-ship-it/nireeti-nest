import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/init
 * Initialize database with admin user and basic data
 * This runs automatically when first accessed
 */
export async function GET() {
  try {
    // Check if admin exists
    const adminEmail = 'admin@thenireetinest.com';
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Database already initialized',
        adminExists: true,
        loginEmail: adminEmail,
        hint: 'Use password: Admin@123456'
      });
    }

    // Create admin user
    const hashedPassword = await hashPassword('Admin@123456');

    const admin = await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
      }
    });

    // Create default categories
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

    let categoriesCreated = 0;
    for (const cat of categories) {
      const exists = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!exists) {
        await db.category.create({ data: cat });
        categoriesCreated++;
      }
    }

    // Create default banner
    const bannerExists = await db.banner.findFirst();
    if (!bannerExists) {
      await db.banner.create({
        data: {
          title: 'Welcome to The Nireeti Nest',
          subtitle: 'Premium Home Decor & Lifestyle',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920',
          isActive: true,
          order: 1,
        }
      });
    }

    return NextResponse.json({
      message: 'Database initialized successfully!',
      adminCreated: true,
      loginEmail: admin.email,
      loginPassword: 'Admin@123456',
      categoriesCreated,
      important: 'Save these credentials securely!'
    });

  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
