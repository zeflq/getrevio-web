import { Merchant } from '@/types/domain';
/**
 * Server-Side Auth Helpers
 * For use in Server Components and Server Actions
 */

import { cookies } from 'next/headers';
import type { User } from './client';

// External API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type ServerSession = {
  user: User;
  session?: {
    activeOrganizationId?: string | null;
    expiresAt?: string;
  };
  merchant:{
    id: string;
    name: string;
    plan: string;
    status: string;
    onboardingCompleted: boolean;
    createdAt: string;
  }
};

/**
 * Get session from API by calling /api/auth/get-session
 * Use in Server Components and Server Actions
 */
export async function getSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = await cookies();

    // Get all cookies and format them for the Cookie header
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    if (!cookieHeader) {
      return null;
    }

    const res = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: {
        'Cookie': cookieHeader,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error('[Auth] Failed to get session from API:', error);
    return null;
  }
}

/**
 * Get tenant ID from session
 */
export async function getTenantId(): Promise<string | null> {
  const session = await getSession();
  return session?.session?.activeOrganizationId || null;
}

/**
 * Require tenant ID (throw if not found)
 */
export async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId();

  if (!tenantId) {
    throw new Error('User has no organization (tenant)');
  }

  return tenantId;
}
