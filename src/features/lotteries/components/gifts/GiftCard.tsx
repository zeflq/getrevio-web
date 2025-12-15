"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { GiftFormValue } from "./types";
import { cn } from "@/lib/utils";

type GiftCardProps = {
  gift: GiftFormValue;
  onClick: () => void;
  onDelete: () => void;
  probability?: number; // 0–100
  color?: string;
  isPendingNewGift?: boolean;
};

export function GiftCard({
  gift,
  onClick,
  onDelete,
  probability,
  color,
  isPendingNewGift,
}: GiftCardProps) {
  const t = useTranslations("lotteries.giftCard");
  const tTypes = useTranslations("lotteries.giftTypes");

  const displayLabel = gift.rewardLabel || gift.name || t("unnamedGift");
  const weightLabel = t("weightLabel");
  const minPurchaseAmount = gift.minPurchaseAmount;
  const minPurchaseCurrency = gift.minPurchaseCurrency || "EUR";
  const hasMinPurchaseAmount = minPurchaseAmount != null;
  const minPurchaseLabel = hasMinPurchaseAmount
    ? t("minPurchase", {
        amount: minPurchaseAmount,
        currency: minPurchaseCurrency,
      })
    : undefined;
  const validityDays = gift.validityDays;
  const validityLabel =
    validityDays != null && t("validity", { days: validityDays });

  const pendingClasses = isPendingNewGift
  ? "border-dashed pointer-events-none"
  : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-card md:p-3 p-2 text-left shadow-sm hover:border-primary/60 border-primary/90 transition-colors",
        pendingClasses
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 space-y-1.5">
          {/* Top row: Color dot + Gift name | Probability */}
          <div className="flex justify-between gap-2 items-baseline">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {color && <div className={`h-3 w-3 rounded-sm ${color} flex-shrink-0`} />}
              <span className="text-base font-semibold truncate">{displayLabel}</span>
            </div>
            {typeof probability === "number" && (
              <span className="text-sm font-semibold text-primary flex-shrink-0">
                {probability.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Second row: Gift type badge */}
          <div>
            <span className="inline-flex items-center rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {tTypes(gift.kind)}
            </span>
          </div>

          {/* Third row: Constraints with icons */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {minPurchaseLabel && (
              <span className="flex items-center gap-1">
                <span className="text-xs">💰</span>
                {minPurchaseLabel}
              </span>
            )}
            {validityLabel && (
              <span className="flex items-center gap-1">
                <span className="text-xs">⏱️</span>
                {validityLabel}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="text-xs">⚖️</span>
              {weightLabel}: {gift.weight}
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          asChild
        >
          <span>x</span>
        </Button>
      </div>
    </button>
  );
}
