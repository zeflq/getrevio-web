import * as React from "react";

import { useSession } from "@/lib/auth-client";

export function useActiveTenantId() {
  const { data: session } = useSession();

  return React.useMemo(() => {
    const raw =
      (session as any)?.session?.activeOrganizationId ??
      (session as any)?.user?.activeOrganizationId ??
      (session as any)?.user?.tenantId ??
      undefined;

    return typeof raw === "string" && raw.length > 0 ? raw : undefined;
  }, [session]);
}
