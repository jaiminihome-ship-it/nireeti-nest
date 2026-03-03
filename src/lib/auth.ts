import { db } from '@/lib/db';
import type { User } from '@/types';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Simple JWT-like token generation (for demo purposes)
// In production, use a proper JWT library

const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production';

export function generateToken(userId: string, email: string, role: string): string {
  const payload = {
    userId,
    email,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    iat: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
    if (decoded.exp < Date.now()) {
      return null;
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt or argon2
  const encoder = new TextEncoder();
  const data = encoder.encode(password + TOKEN_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role as 'USER' | 'ADMIN',
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role as 'USER' | 'ADMIN',
    };
  } catch {
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function setAuthCookie(token: string): string {
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearAuthCookie(): string {
  return 'auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
