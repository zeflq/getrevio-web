import { Merchant } from '@/types/domain';
/**
 * Server-Side Auth Helpers
 * For use in Server Components and Server Actions
 */

import type { User } from './client';
import { proxyToAPI } from '@/lib/serverProxy';

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
    const session = await proxyToAPI<ServerSession>({
      endpoint: '/api/auth/get-session',
      fetchOptions: {
        cache: 'no-store',
      },
    });

    return session;
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
