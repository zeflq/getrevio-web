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

  // 👇 valeurs live du formulaire
  const watchedGifts = (watch("gifts") ?? []) as LotteryGiftFormValue[];

  // 👇 merge meta du fieldArray (__fieldId) + valeurs live
  const gifts: LotteryGiftField[] = giftFields.map((field, index) => ({
    ...field,
    ...(watchedGifts[index] ?? {}),
  }));

  const noWinWeight = watch("noWinWeight") ?? 0;

  // ---- Probability calculations ----
  const totalGiftWeight = gifts.reduce(
    (sum, gift) => sum + (Number(gift.weight) || 0),
    0
  );
  const totalWeight = totalGiftWeight + Number(noWinWeight || 0);
  const winProbability =
    totalWeight > 0 ? (totalGiftWeight / totalWeight) * 100 : 0;

  const giftProbabilities: number[] =
    totalWeight > 0
      ? gifts.map((g) => ((Number(g.weight) || 0) / totalWeight) * 100)
      : gifts.map(() => 0);

  const palette = [
    "bg-(--color-chart-1)",
    "bg-(--color-chart-2)",
    "bg-(--color-chart-3)",
    "bg-(--color-chart-4)",
    "bg-(--color-chart-5)",
  ];

  const canAddGift = gifts.length < MAX_GIFTS;

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
    const newIndex = gifts.length;
    append(createEmptyGift());

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

  const saveClickedRef = React.useRef(false);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      if (sheetState?.mode === "create" && !saveClickedRef.current) {
        remove(sheetState.index);
      }
      setSheetState(null);
      saveClickedRef.current = false;
    }
  };

  const handleAutoBalance = () => {
    if (gifts.length === 0) return;
    const even = 1;
    gifts.forEach((g, idx) => {
      update(idx, { ...g, weight: even });
    });
  };

  const handleSortByProbability = () => {
    const pairs = gifts.map((g, i) => ({ g, i, p: giftProbabilities[i] }));
    pairs.sort((a, b) => b.p - a.p);
    pairs.forEach((pair, newIdx) => {
      update(newIdx, pair.g);
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Gifts list */}
        <EditSection title={t("title")} description={t("description")}>
          <Toolbar className="mb-3 rounded-lg shadow-sm">
            <ToolbarGroup>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground mr-2">
                  {gifts.length}
                </span>
                {t("giftsCount")}
              </div>
              <ToolbarSeparator />
              <div className="text-sm text-muted-foreground">
                {t("winChance")}{" "}
                <span className="font-semibold text-foreground">
                  {winProbability.toFixed(1)}%
                </span>
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
                  ariaLabel: t("sortByProbability"),
                  icon: <ArrowUpDown className="h-4 w-4" />,
                  onClick: handleSortByProbability,
                },
                {
                  ariaLabel: t("addGift"),
                  icon: <Plus className="h-4 w-4" />,
                  onClick: handleAddGift,
                  variant: "default",
                  disabled: !canAddGift,
                },
              ]}
            />
          </Toolbar>

          {gifts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground text-center">
              <div className="mb-2">{t("noGifts")}</div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddGift}
                disabled={!canAddGift}
              >
                {t("addFirstGift")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {gifts.map((gift, index) => {
                const isPendingNewGift =
                  sheetState?.mode === "create" &&
                  sheetState.index === index;

                return (
                  <GiftCard
                    key={gift.__fieldId}
                    gift={gift}
                    probability={giftProbabilities[index]}
                    color={palette[index % palette.length]}
                    onClick={() => handleEditGift(index)}
                    onDelete={() => handleDeleteGift(index)}
                    isPendingNewGift={isPendingNewGift}
                  />
                );
              })}
            </div>
          )}

          {giftsErrorMessage && (
            <p className="mt-3 text-xs text-destructive/80">
              {giftsErrorMessage}
            </p>
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
                <div className="flex items-center gap-2 text-xs">
                  <div>
                    {t("totalGiftWeight")}{" "}
                    <span className="font-medium text-foreground">
                      {totalGiftWeight}
                    </span>
                  </div>
                </div>
              </ToolbarGroup>
              <ToolbarSeparator />
              <ToolbarGroup>
                <div className="flex items-center gap-2 text-xs">
                  <div>
                    {t("noWinWeight")}{" "}
                    <span className="font-medium text-foreground">
                      {noWinWeight}
                    </span>
                  </div>
                </div>
              </ToolbarGroup>
            </Toolbar>

            {totalWeight > 0 && (
              <div className="space-y-1.5">
                {/* Percentage labels */}
                <div className="flex items-center justify-between text-xs">
                  <div className="font-medium text-foreground">
                    {winProbability.toFixed(1)}% {t("winLabel")}
                  </div>
                  <div className="text-muted-foreground">
                    {(100 - winProbability).toFixed(1)}% {t("noWinLabel")}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full overflow-hidden rounded-full bg-muted">
                  <div className="flex h-2 w-full">
                    {gifts.map((gift, i) => (
                      <div
                        key={gift.__fieldId}
                        className={`${palette[i % palette.length]} h-full`}
                        title={`${gift.name ?? t("giftLabel")}: ${giftProbabilities[
                          i
                        ].toFixed(1)}%`}
                        style={{ width: `${giftProbabilities[i]}%` }}
                      />
                    ))}
                    {noWinWeight > 0 && (
                      <div
                        className="h-full bg-neutral-400"
                        title={`${t("noWinLabel")}: ${(
                          ((Number(noWinWeight) || 0) / totalWeight) *
                          100
                        ).toFixed(1)}%`}
                        style={{
                          width: `${
                            ((Number(noWinWeight) || 0) / totalWeight) * 100
                          }%`,
                        }}
                      />
                    )}
                  </div>
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
          onSaveClicked={() => {
            saveClickedRef.current = true;
          }}
        />
      )}
    </>
  );
}
