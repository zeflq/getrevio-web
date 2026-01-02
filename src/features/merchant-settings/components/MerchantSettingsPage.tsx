"use client";

import { useMerchantSettings } from "../hooks/useMerchantSettings";
import { MerchantSettingsSection } from "./MerchantSettingsSection";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export function MerchantSettingsPage({ tenantId }: { tenantId: string }) {
  const { data, isLoading, error } = useMerchantSettings(tenantId);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your information and defaults.</p>
        </header>
        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your information and defaults.</p>
        </header>
        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardDescription>
                Failed to load settings. Please refresh the page or contact support.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your information and defaults.</p>
      </header>

      <div className="w-full max-w-2xl space-y-6">
        <MerchantSettingsSection {...data} />
      </div>
    </div>
  );
}
