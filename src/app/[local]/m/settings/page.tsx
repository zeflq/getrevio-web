"use server";

import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-server";
import { MerchantSettingsSection, loadMerchantSettings } from "@/features/merchant-settings";

export default async function MerchantSettingsPage() {
  const sessionResult = await getServerSession();
  if (!sessionResult?.user) {
    redirect("/login");
  }

  const { session } = sessionResult;
  const activeOrganizationId = session?.activeOrganizationId ?? null;
  const settingsData = await loadMerchantSettings({ tenantId: activeOrganizationId });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your information and defaults.</p>
      </header>

      <div className="w-full max-w-2xl space-y-6">
        <MerchantSettingsSection {...settingsData} />
      </div>
    </div>
  );
}
