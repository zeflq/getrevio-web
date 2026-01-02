"use client";

import { MerchantSettingsPage as MerchantSettingsPageClient } from "@/features/merchant-settings/components/MerchantSettingsPage";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";

export default function MerchantSettingsPage() {
  const tenantId = useActiveTenantId();

  if (!tenantId) {
    return null;
  }

  return <MerchantSettingsPageClient tenantId={tenantId} />;
}
