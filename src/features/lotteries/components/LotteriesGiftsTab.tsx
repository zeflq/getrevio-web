// features/lotteries/gifts/LotteriesGiftsTab.tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFormContext, useFieldArray } from "react-hook-form";

import { EditSection } from "@/shared/ui/EditSection";
import { Button } from "@/components/ui/button";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";

import { GiftCard } from "./gifts/GiftCard";
import { EditGiftSheet } from "./gifts/EditGiftSheet";
import { createEmptyGift } from "./gifts/types";
import {
  LotteryConfigFormValues,
  type LotteryGiftFormValue,
} from "../model/lotterySchema";
import { ArrowUpDown, Plus, Scaling } from "lucide-react";

import { IconActionGroup } from "@/shared/ui/IconActionGroup";

type LotteryGiftField = LotteryGiftFormValue & { __fieldId: string };

const MAX_GIFTS = 5;

export function LotteriesGiftsTab() {
  const t = useTranslations("lotteries.giftsTab");
  const form = useFormContext<LotteryConfigFormValues>();
  const { control, watch, formState } = form;

  const { fields, append, update, remove } = useFieldArray<
    LotteryConfigFormValues,
    "gifts",
    "__fieldId"
  >({
    control,
    name: "gifts",
    keyName: "__fieldId",
  });

  const giftFields = fields as LotteryGiftField[];
  const noWinWeight = watch("noWinWeight") ?? 0;

  // ---- Probability calculations ----
  const totalGiftWeight = giftFields.reduce(
    (sum, gift) => sum + (Number(gift.weight) || 0),
    0
  );
  const totalWeight = totalGiftWeight + Number(noWinWeight || 0);
  const winProbability =
    totalWeight > 0 ? (totalGiftWeight / totalWeight) * 100 : 0;

  const giftProbabilities: number[] =
    totalWeight > 0
      ? giftFields.map((g) => ((Number(g.weight) || 0) / totalWeight) * 100)
      : giftFields.map(() => 0);

  const palette = [
    "bg-(--color-chart-1)",
    "bg-(--color-chart-2)",
    "bg-(--color-chart-3)",
    "bg-(--color-chart-4)",
    "bg-(--color-chart-5)",
  ];

  const canAddGift = giftFields.length < MAX_GIFTS;

  // ---- Validation message ----
  const giftsErrorMessage = React.useMemo(() => {
    const error = formState.errors.gifts;
    if (!error) return undefined;

    if (Array.isArray(error)) {
      for (const entry of error) {
        if (
          entry &&
          typeof entry === "object" &&
          "message" in entry &&
          typeof entry.message === "string"
        ) {
          return entry.message;
        }
      }
      return undefined;
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    return undefined;
  }, [formState.errors.gifts]);

  // ---- Sheet state ----
  type SheetState =
    | {
        mode: "create";
        index: number; // Index where new gift will be added
      }
    | {
        mode: "edit";
        index: number;
      }
    | null;

  const [sheetState, setSheetState] = React.useState<SheetState>(null);
  const sheetOpen = sheetState !== null;

  const handleAddGift = () => {
    if (!canAddGift) return;
    // Add empty gift to form, then open sheet to edit it
    const newIndex = giftFields.length;
    append(createEmptyGift());

    // Clear validation errors for the new gift (it's empty, user hasn't touched it yet)
    setTimeout(() => {
      form.clearErrors(`gifts.${newIndex}`);
    }, 0);

    setSheetState({
      mode: "create",
      index: newIndex,
    });
  };

  const handleEditGift = (index: number) => {
    setSheetState({
      mode: "edit",
      index,
    });
  };

  const handleDeleteGift = (index: number) => {
    remove(index);
  };

  // Track if user clicked Save (vs Cancel)
  const saveClickedRef = React.useRef(false);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      // If user cancelled (didn't click Save) and was creating a new gift, remove it
      if (sheetState?.mode === "create" && !saveClickedRef.current) {
        remove(sheetState.index);
      }
      setSheetState(null);
      saveClickedRef.current = false; // Reset for next time
    }
  };

  const handleAutoBalance = () => {
    if (giftFields.length === 0) return;
    const even = 1;
    giftFields.forEach((g, idx) => {
      update(idx, { ...g, weight: even });
    });
  };

  const handleSortByProbability = () => {
    const pairs = giftFields.map((g, i) => ({ g, i, p: giftProbabilities[i] }));
    pairs.sort((a, b) => b.p - a.p);
    pairs.forEach((pair, newIdx) => {
      update(newIdx, pair.g);
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Gifts list */}
        <EditSection
          title={t("title")}
          description={t("description")}
        >
          <Toolbar className="mb-3 rounded-lg shadow-sm">
            <ToolbarGroup>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground mr-2">{giftFields.length}</span>
                {t("giftsCount")}
              </div>
              <ToolbarSeparator />
              <div className="text-sm text-muted-foreground">
                {t("winChance")} <span className="font-semibold text-foreground">{winProbability.toFixed(1)}%</span>
              </div>
            </ToolbarGroup>
            
              <IconActionGroup
                actions={[
                  {
                    label: t("autoBalanceWeights"),
                    ariaLabel: t("autoBalanceWeights"),
                    icon: <Scaling className="h-4 w-4" />,
                    onClick: handleAutoBalance,
                  },
                  {
                    //label: t("sortByProbability"),
                    ariaLabel: t("sortByProbability"),
                    icon: <ArrowUpDown className="h-4 w-4" />,
                    onClick: handleSortByProbability,
                  },
                  {
                    // label: t("addGift"),
                    ariaLabel: t("addGift"),
                    icon: <Plus className="h-4 w-4" />,
                    onClick: handleAddGift,
                    variant: "default",
                    disabled: !canAddGift,
                  },
                ]}
              />
          </Toolbar>

          {giftFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground text-center">
              <div className="mb-2">{t("noGifts")}</div>
              <Button type="button" size="sm" onClick={handleAddGift} disabled={!canAddGift}>
                {t("addFirstGift")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {giftFields.map((field, index) => (
                <GiftCard
                  key={field.__fieldId}
                  gift={field}
                  probability={giftProbabilities[index]}
                  color={palette[index % palette.length]}
                  onClick={() => handleEditGift(index)}
                  onDelete={() => handleDeleteGift(index)}
                />
              ))}
            </div>
          )}

          {giftsErrorMessage && (
            <p className="mt-3 text-xs text-destructive/80">{giftsErrorMessage}</p>
          )}
          {!canAddGift && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t("limitReached", { limit: MAX_GIFTS })}
            </p>
          )}
        </EditSection>

        {/* Probability summary */}
        <EditSection
          title={t("probabilitySummary")}
          description={t("probabilitySummaryDescription")}
        >
          <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-3">
            <Toolbar className="h-auto justify-start gap-2 rounded-lg border-none bg-transparent p-0">
              <ToolbarGroup>
                <div className="flex items-center gap-2">
                  <div>
                    {t("totalGiftWeight")}{" "}
                    <span className="font-medium text-foreground">{totalGiftWeight}</span>
                  </div>
                </div>
              </ToolbarGroup>
              <ToolbarSeparator />
              <ToolbarGroup>
                <div className="flex items-center gap-2">
                  <div>
                    {t("noWinWeight")}{" "}
                    <span className="font-medium text-foreground">{noWinWeight}</span>
                  </div>
                </div>
              </ToolbarGroup>
              {/* <ToolbarSeparator />
              <ToolbarGroup>
                <div className="text-muted-foreground">
                  Win chance{" "}
                  <span className="font-semibold text-foreground">{winProbability.toFixed(1)}%</span>
                </div>
              </ToolbarGroup> */}
            </Toolbar>

            {totalWeight > 0 && (
              <div className="mt-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="flex h-2 w-full">
                  {giftFields.map((g, i) => (
                    <div
                      key={g.__fieldId}
                      className={`${palette[i % palette.length]} h-full`}
                      title={`${g.name ?? t("giftLabel")}: ${giftProbabilities[i].toFixed(1)}%`}
                      style={{ width: `${giftProbabilities[i]}%` }}
                    />
                  ))}
                  {noWinWeight > 0 && (
                    <div
                      className="h-full bg-neutral-400"
                      title={`${t("noWinLabel")}: ${((Number(noWinWeight) || 0) / totalWeight * 100).toFixed(1)}%`}
                      style={{ width: `${((Number(noWinWeight) || 0) / totalWeight) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t("probabilityHint")}
            </p>
          </div>
        </EditSection>
      </div>

      {/* Sheet for add/edit gift */}
      {sheetState && (
        <EditGiftSheet
          open={sheetOpen}
          onOpenChange={handleSheetOpenChange}
          giftIndex={sheetState.index}
          isNew={sheetState.mode === "create"}
          onSaveClicked={() => { saveClickedRef.current = true; }}
        />
      )}
    </>
  );
}
