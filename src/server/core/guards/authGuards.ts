import { headers as serverHeaders } from "next/headers";

import { getServerSession } from "@/lib/auth-server";
import { SUPER_ADMIN } from "@/lib/utils";
import type { Role } from "@/server/core/utils/resolveTenantScope";

export class GuardAuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export type AuthContext = {
  user: { id: string; tenantId?: string; roles?: string[]; email?: string };
  headers: Headers;
  tenantId?: string;
  isSuperAdmin: boolean;
};

export async function resolveAuthContext(): Promise<AuthContext> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new GuardAuthError(401, "UNAUTHORIZED");
  }

  const hdrs = await serverHeaders();

  const tenantId = (session as any)?.session?.activeOrganizationId ?? null;
  const role: Role =
    (session.user?.globalRole === SUPER_ADMIN ? "SUPER_ADMIN" : "TENANT_USER") as Role;

  return {
    user: {
      id: session.user.id as string,
      tenantId: tenantId ?? undefined,
      email: (session.user as { email?: string })?.email ?? undefined,
      roles: session.user?.globalRole ? [session.user.globalRole] : undefined,
    },
    headers: hdrs,
    tenantId: tenantId ?? undefined,
    isSuperAdmin: role === "SUPER_ADMIN",
  };
}

export function assertTenantAccess(ctx: AuthContext, tenantId?: string | null) {
  if (!tenantId) {
    throw new GuardAuthError(400, "TENANT_REQUIRED");
  }

  if (!ctx.isSuperAdmin && tenantId !== ctx.tenantId) {
    throw new GuardAuthError(403, "FORBIDDEN");
  }

  return tenantId;
}

export function assertSuperAdmin(ctx: AuthContext) {
  if (!ctx.isSuperAdmin) {
    throw new GuardAuthError(403, "FORBIDDEN");
  }
}
