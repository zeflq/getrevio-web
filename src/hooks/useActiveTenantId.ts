import * as React from "react";

import { useSession } from "@/lib/auth/client";

export function useActiveTenantId(): string | null {
  const { data: session } = useSession();

  return React.useMemo(() => {
    const raw = session?.session.activeOrganizationId;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  }, [session]);
}
