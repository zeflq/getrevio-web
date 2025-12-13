"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { RHFCombobox, RHFInput, RHFSelect } from "@/components/form/controls";
import type { LiteListe } from "@/types/lists";
import {
  booleanOptions,
  lotteryCooldownOptions,
} from "@/features/lotteries/model/lotterySchema";

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
}: Props) {
  const { register } = useFormContext();
  const t = useTranslations("lotteries.form");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3">
        {!merchantId ? (
          <RHFCombobox<LiteListe>
            name="merchantId"
            label={t("merchant.label")}
            options={merchantsLite}
            getOptionValue={(m) => m.value}
            getOptionLabel={(m) => m.label}
            placeholder={t("merchant.placeholder")}
            searchPlaceholder={t("merchant.searchPlaceholder")}
            requiredStar
            disabled={disabled}
          />
        ) : (
          <input type="hidden" {...register("merchantId")} value={merchantId} />
        )}

        <RHFInput
          name="name"
          label={t("name.label")}
          placeholder={t("name.placeholder")}
          requiredStar
          disabled={disabled}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFSelect
            name="enabled"
            label={t("enabled.label")}
            options={booleanOptions}
            placeholder={t("enabled.placeholder")}
            disabled={disabled}
            requiredStar
          />
          <RHFSelect
            name="guaranteeWinOnFirstPlay"
            label={t("guaranteeWin.label")}
            options={booleanOptions}
            placeholder={t("guaranteeWin.placeholder")}
            disabled={disabled}
            requiredStar
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFInput
            name="playLimitPerUser"
            label={t("playLimit.label")}
            type="number"
            placeholder={t("playLimit.placeholder")}
            requiredStar
            disabled={disabled}
          />
          <RHFSelect
            name="cooldown"
            label={t("cooldown.label")}
            options={lotteryCooldownOptions}
            placeholder={t("cooldown.placeholder")}
            requiredStar
            disabled={disabled}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFInput
            name="noWinWeight"
            label={t("noWinWeight.label")}
            type="number"
            placeholder={t("noWinWeight.placeholder")}
            description={t("noWinWeight.description")}
            disabled={disabled}
          />
          <div className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
