import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || 'nireeti-nest-super-secret-key-2024-production';

export function generateToken(userId: string, email: string, role: string): string {
  const payload = { userId, email, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(password).digest('hex');
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return hashPassword(password).then(h => h === hashed);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = verifyToken(token);
    if (!decoded) return null;

    return prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string): string {
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure`;
}

export function clearAuthCookie(): string {
  return 'auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}
