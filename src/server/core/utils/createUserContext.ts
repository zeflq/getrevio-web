import { ActionError } from "@/lib/action-error";
import type { Role } from "./resolveTenantScope";

export type UserContext = {
  id: string;
  role: Role;
  tenantId: string | null;
};

export function createUserContext(session: any): UserContext {
  if (!session?.user?.id) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const role = (session?.user?.globalRole ?? "TENANT_USER") as Role;
  const tenantId =
    session?.session?.activeOrganizationId ?? session?.user?.activeOrganizationId ?? null;

  return {
    id: session.user.id as string,
    role,
    tenantId,
  };
}
