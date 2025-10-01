"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { EditMerchantSheet } from "@/features/merchants/components/EditMerchantSheet";
import { Merchant } from "@/types/domain";

export interface MerchantHeaderProps {
  merchant?: Merchant;
  isLoading?: boolean;
}

export function MerchantHeader({ merchant }: MerchantHeaderProps) {
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  if ((MerchantHeader as any).prototype && (arguments[0] as any)?.isLoading) {
    return (
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  if (!merchant) return null;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{merchant.name}</h1>
        <p className="text-sm text-muted-foreground">Merchant details and management</p>
      </div>
      <Button variant="outline" onClick={() => setEditSheetOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit Merchant
      </Button>
      <EditMerchantSheet
        merchantId={merchant.id}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </div>
  );
}

export default MerchantHeader;