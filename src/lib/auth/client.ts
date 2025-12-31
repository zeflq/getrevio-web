/**
 * Auth Client - Single Source of Truth
 *
 * This is the ONLY auth client file. Uses better-auth/client.
 *
 * Usage:
 * ```tsx
 * import { useSession, signIn, signUp, signOut } from '@/lib/auth/client'
 *
 * // In your component
 * const { data: session } = useSession()
 * await signIn.email({ email, password })
 * await signUp.email({ name, email, password })
 * await signOut()
 * ```
 */

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Auth client configured to match backend auth.ts
 *
 * Backend plugins:
 * - organization (mapped to Merchant model)
 * - customSession (adds provider, activeOrganizationId)
 *
 * Session structure returned from backend:
 * {
 *   user: { ...user, provider, globalRole },
 *   session: { ...session, activeOrganizationId },
 *   organization: { ...merchant, email, onboardingStep } // mapped to Merchant model
 * }
 *
 * Additional fields:
 * - user.globalRole: string (from user.additionalFields)
 * - user.provider: string (from customSession)
 * - session.activeOrganizationId: string (from customSession + databaseHooks)
 * - organization.email: string (from organization.additionalFields)
 * - organization.onboardingStep: number (from organization.additionalFields)
 */
export const authClient = createAuthClient({
  baseURL: API_URL,

  plugins: [
    // Match backend organization plugin
    organizationClient(),

    // Infer additional fields from backend
    inferAdditionalFields({
      user: {
        // From backend user.additionalFields
        globalRole: {
          type: "string",
          required: false,
        },
        // From backend customSession
        provider: {
          type: "string",
          required: false,
        },
      },
      session: {
        // From backend customSession and databaseHooks
        activeOrganizationId: {
          type: "string",
          required: false,
        },
      },
      organization: {
        // From backend organization plugin (mapped to Merchant model)
        // These are the additionalFields defined in the backend
        email: {
          type: "string",
          required: false,
        },
        onboardingStep: {
          type: "number",
          required: false,
        },
      },
    }),
  ],
});

// ============================================================================
// Type Definitions
// ============================================================================

// Infer types from the client (includes all custom fields from inferAdditionalFields)
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

// ============================================================================
// Convenience Exports (for cleaner imports)
// ============================================================================

/**
 * React hook to get current session
 * Uses nanostores' useStore to consume the session atom
 *
 * Returns: { data: Session | null, isPending: boolean, error: Error | null }
 *
 * Usage: const { data: session, isPending, error } = useSession()
 */
export function useSession() {
  return authClient.useSession();
}

/**
 * Sign in methods
 */
export const signIn = authClient.signIn;

/**
 * Sign up methods
 */
export const signUp = authClient.signUp;

/**
 * Sign out
 */
export const signOut = authClient.signOut;
