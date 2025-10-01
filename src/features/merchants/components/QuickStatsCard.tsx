"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MerchantQuickStats } from "../api/getMerchantQuickStats";

export interface QuickStatsCardProps {
  stats?: MerchantQuickStats;
  isLoading?: boolean;
}

export function QuickStatsCard({ stats, isLoading }: QuickStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Stats</CardTitle>
          <p className="text-sm text-muted-foreground">Overview of merchant activity</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick Stats</CardTitle>
        <p className="text-sm text-muted-foreground">Overview of merchant activity</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Places</p>
            <p className="text-2xl font-bold">{stats.places}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Campaigns</p>
            <p className="text-2xl font-bold">{stats.campaigns}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Shortlinks</p>
            <p className="text-2xl font-bold">{stats.shortlinks}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickStatsCard;