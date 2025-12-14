"use client";

import { useTranslations } from "next-intl";

import type { LandingAddonInspectorProps } from "../plugin";
import { RHFSelect } from "@/components/form/controls";
import { useLotteriesLite } from "@/features/lotteries/hooks/useLotteryCrud";

const contactMethodOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

export function LotteryAddonInspector({
  fieldName,
  disabled,
}: LandingAddonInspectorProps) {
  const t = useTranslations("landings.editor.addons.lotteryAddon");

  const { data: lotteryOptions, isLoading } = useLotteriesLite({});

  return (
    <div className="space-y-4">
      <RHFSelect
        name={`${fieldName}.lotteryId`}
        label={t.has("lottery") ? t("lottery") : "Lottery"}
        options={lotteryOptions ?? []}
        placeholder={isLoading ? "Loading..." : "Select a lottery"}
        disabled={disabled || isLoading}
        allowClear
        clearLabel={t.has("noLottery") ? t("noLottery") : "None"}
      />
      <RHFSelect
        name={`${fieldName}.contactMethod`}
        label={t.has("contactMethod") ? t("contactMethod") : "Contact Method"}
        options={contactMethodOptions}
        disabled={disabled}
        requiredStar
      />
    </div>
  );
}
