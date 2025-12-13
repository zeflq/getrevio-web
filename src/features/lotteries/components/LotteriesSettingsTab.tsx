"use client";

"use client";

import type { LiteListe } from "@/types/lists";
import { EditSection } from "@/shared/ui/EditSection";
import { LotteryFormFields } from "./LotteryFormFields";

type Props = {
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
};

export function LotteriesSettingsTab({ disabled, merchantId, merchantsLite = [] }: Props) {
  return (
    <EditSection title="Settings" description="Configure the lottery basics.">
      <div className="space-y-6">
        <LotteryFormFields
          disabled={disabled}
          merchantId={merchantId}
          merchantsLite={merchantsLite}
          showGifts={false}
        />
      </div>
    </EditSection>
  );
}
