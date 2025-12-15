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
  const approxChanceLabel = t("approxChance", {
    chance: probability?.toFixed(1) ?? "0.0",
  });
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
        "w-full rounded-lg border bg-card p-4 text-left shadow-sm hover:border-primary/60 border-primary/90 transition-colors",
        pendingClasses
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {color && <div className={`h-3 w-3 rounded-sm ${color}`} />}
            <span className="text-sm font-semibold">{displayLabel}</span>
            <span className="inline-flex items-center rounded-full border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {tTypes(gift.kind)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {weightLabel}: <span className="font-medium">{gift.weight}</span>
            {typeof probability === "number" && (
              <>
                {" "}
                · <span className="font-medium">{approxChanceLabel}</span>
              </>
            )}
          </p>

          {minPurchaseLabel && (
            <p className="text-xs text-muted-foreground">
              {minPurchaseLabel}
              {validityLabel && (
                <>
                  {" "}
                  · {validityLabel}
                </>
              )}
            </p>
          )}
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground"
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
