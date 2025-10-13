// Top-level imports
"use client";

import { use, useState } from 'react';
import { Pencil } from 'lucide-react';
import { SinglePageHeader } from '@/shared/ui/SinglePageHeader';
import { MerchantDetailsCard, QuickStatsCard, EditMerchantSheet } from '@/features/merchants';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MerchantThemesTab } from '@/features/themes/components/MerchantThemesTab';
import { useMerchantItem } from '@/features/merchants/hooks/useMerchantCrud';

export default function MerchantDetailPage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: merchant, isLoading, error } = useMerchantItem(resolvedParams.merchantId);
  //const { data: stats, isLoading: isStatsLoading } = useMerchantQuickStats({ id: resolvedParams.merchantId });
  const [editSheetOpen, setEditSheetOpen] = useState(false);
console.log('merchant', merchant);
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SinglePageHeader
        title={merchant?.name ?? 'Merchant'}
        description="Merchant details and management"
        isLoading={isLoading}
        actions={[
          {
            variant: 'ghost',
            icon: <Pencil className="h-4 w-4" />,
            ariaLabel: 'Edit merchant',
            onClick: () => setEditSheetOpen(true),
          },
        ]}
      />

      {merchant?.id && (
        <EditMerchantSheet
          merchantId={merchant.id}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
        />
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load merchant. Please try again.
          </p>
        </div>
      )}

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="quick">Quick Info</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value="quick">
          <div className="grid gap-6 md:grid-cols-2">
            <MerchantDetailsCard merchant={merchant} isLoading={isLoading} />
            {/* <QuickStatsCard stats={stats} isLoading={isStatsLoading} /> */}
          </div>
        </TabsContent>
        <TabsContent value="themes">
          {merchant?.id ? (
            <MerchantThemesTab
              merchantId={merchant.id}
              defaultThemeId={merchant.defaultThemeId}
            />
          ) : (
            <div className="p-4 text-muted-foreground">Loading…</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
