"use client";
import { useFormContext } from "react-hook-form";
import { RHFCombobox, RHFInput, RHFSelect } from "@/components/form/controls";
import type { LiteListe } from "@/types/lists";
import {
  booleanOptions,
  lotteryCooldownOptions,
} from "@/features/lotteries/model/lotterySchema";
import { LotteryGiftsBuilder } from "./LotteryGiftsBuilder";

type Props = {
  disabled?: boolean;
  merchantId?: string;
  merchantsLite?: LiteListe[];
  showGifts?: boolean;
};

export function LotteryFormFields({
  disabled,
  merchantId,
  merchantsLite = [],
  showGifts = true,
}: Props) {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3">
        {!merchantId ? (
          <RHFCombobox<LiteListe>
            name="merchantId"
            label="Merchant"
            options={merchantsLite}
            getOptionValue={(m) => m.value}
            getOptionLabel={(m) => m.label}
            placeholder="Select merchant"
            searchPlaceholder="Search merchants…"
            requiredStar
            disabled={disabled}
          />
        ) : (
          <input type="hidden" {...register("merchantId")} value={merchantId} />
        )}

        <RHFInput
          name="name"
          label="Lottery name"
          placeholder="Summer Spin"
          requiredStar
          disabled={disabled}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFSelect
            name="enabled"
            label="Enabled"
            options={booleanOptions}
            placeholder="Enabled?"
            disabled={disabled}
            requiredStar
          />
          <RHFSelect
            name="guaranteeWinOnFirstPlay"
            label="Guarantee win"
            options={booleanOptions}
            placeholder="Guarantee win?"
            disabled={disabled}
            requiredStar
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFInput
            name="playLimitPerUser"
            label="Play limit per user"
            type="number"
            placeholder="1"
            requiredStar
            disabled={disabled}
          />
          <RHFSelect
            name="cooldown"
            label="Cooldown"
            options={lotteryCooldownOptions}
            placeholder="Select cooldown"
            requiredStar
            disabled={disabled}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFInput
            name="noWinWeight"
            label="No-win weight"
            type="number"
            placeholder="0"
            description="Higher value makes no-win outcomes more common."
            disabled={disabled}
          />
          <div className="hidden sm:block" />
        </div>
      </div>

      {showGifts && <LotteryGiftsBuilder name="gifts" disabled={disabled} />}
    </div>
  );
}
