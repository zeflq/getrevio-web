"use client";

import { use } from 'react';
import { MerchantDetailsCard, MerchantHeader, QuickStatsCard, useMerchant, useMerchantQuickStats } from '@/features/merchants';

export default function MerchantDetailPage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: merchant, isLoading, error } = useMerchant({ id: resolvedParams.merchantId });
  const { data: stats, isLoading: isStatsLoading } = useMerchantQuickStats({ id: resolvedParams.merchantId });
  

  return (
    <div className="flex flex-1 flex-col gap-6">
          <MerchantHeader merchant={merchant} isLoading={isLoading} />
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Failed to load merchant. Please try again.
              </p>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <MerchantDetailsCard merchant={merchant} isLoading={isLoading} />
            <QuickStatsCard stats={stats} isLoading={isStatsLoading} />
          </div>
    </div>
  );
}