"use client";

import { useLocale } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFSelect } from "@/components/form/controls";
import { useLotteriesLite } from "@/features/lotteries/hooks/useLotteryCrud";
import { resolveFieldLabel, resolveFieldPlaceholder } from "../../utils/translations";

const contactMethodOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

export function LotteryAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const locale = useLocale() as "en" | "fr" | "ar";

  const { data: lotteryOptions, isLoading } = useLotteriesLite({});

  // Use KIND i18n for field labels (shared across all instances)
  const lotteryLabel = resolveFieldLabel("lotteryAddon", "lotteryId", locale);
  const lotteryPlaceholder = resolveFieldPlaceholder("lotteryAddon", "lotteryId", locale);

  const contactMethodLabel = resolveFieldLabel("lotteryAddon", "contactMethod", locale);
  const contactMethodPlaceholder = resolveFieldPlaceholder("lotteryAddon", "contactMethod", locale);

  return (
    <div className="space-y-4">
      <RHFSelect
        name={`${fieldName}.lotteryId`}
        label={lotteryLabel}
        options={lotteryOptions ?? []}
        placeholder={isLoading ? "Loading..." : (lotteryPlaceholder ?? "Select a lottery")}
        disabled={disabled || isLoading}
      />
      <RHFSelect
        name={`${fieldName}.contactMethod`}
        label={contactMethodLabel}
        options={contactMethodOptions}
        placeholder={contactMethodPlaceholder}
        disabled={disabled}
        requiredStar
      />
    </div>
  );
}
