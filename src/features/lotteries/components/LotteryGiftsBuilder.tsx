"use client";

import * as React from "react";
import { useFieldArray, useFormContext, FieldValues } from "react-hook-form";
import { RHFInput, RHFSelect } from "@/components/form/controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { LotteryGiftFormValue } from "@/features/lotteries/model/lotterySchema";

const GIFT_KINDS = [
  { value: "free_item", label: "Produit offert" },
  { value: "discount", label: "Réduction %" },
  { value: "credit", label: "Crédit / bon d'achat" },
  { value: "other", label: "Autre" },
];

type LotteryGiftsBuilderProps = {
  name: string;
  disabled?: boolean;
};

export function LotteryGiftsBuilder({ name, disabled }: LotteryGiftsBuilderProps) {
  const { control, watch } = useFormContext<FieldValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const gifts = watch(name) as LotteryGiftFormValue[] | undefined;

  const handleAddGift = () => {
    const newId = `gift_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    append({
      id: newId,
      name: "",
      kind: "free_item",
      weight: 1,
      imageUrl: undefined,
      rewardLabel: "",
      minPurchaseAmount: undefined,
      minPurchaseCurrency: "EUR",
      validityDays: undefined,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Cadeaux (gifts)</h3>
        <Button type="button" size="sm" onClick={handleAddGift} disabled={disabled}>
          Ajouter un cadeau
        </Button>
      </div>

      {(!gifts || gifts.length === 0) && (
        <p className="text-xs text-muted-foreground">
          Aucun cadeau défini. Ajoutez au moins un cadeau pour activer le jeu.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const baseName = `${name}.${index}`;

          return (
            <div
              key={field.id}
              className={cn("rounded-lg border border-border bg-muted/20 p-3 space-y-3")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Cadeau #{index + 1}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => remove(index)}
                  disabled={disabled}
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <RHFInput
                  name={`${baseName}.name`}
                  label="Nom interne"
                  placeholder="Ex. 1 margherita"
                  requiredStar
                  disabled={disabled}
                />
                <RHFSelect
                  name={`${baseName}.kind`}
                  label="Type"
                  options={GIFT_KINDS}
                  placeholder="Sélectionner un type"
                  requiredStar
                  disabled={disabled}
                />
                <RHFInput
                  name={`${baseName}.weight`}
                  label="Poids (probabilité)"
                  type="number"
                  placeholder="Ex. 10"
                  requiredStar
                  disabled={disabled}
                  description="Plus le poids est élevé, plus le cadeau est fréquent."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <RHFInput
                  name={`${baseName}.rewardLabel`}
                  label="Label affiché"
                  placeholder="Ex. 1 pizza margherita offerte"
                  requiredStar
                  disabled={disabled}
                />
                <RHFInput
                  name={`${baseName}.imageUrl`}
                  label="Image (URL)"
                  placeholder="https://…"
                  disabled={disabled}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <RHFInput
                  name={`${baseName}.minPurchaseAmount`}
                  label="Montant minimum (€)"
                  type="number"
                  placeholder="Ex. 10"
                  disabled={disabled}
                />
                <RHFInput
                  name={`${baseName}.minPurchaseCurrency`}
                  label="Devise"
                  placeholder="EUR"
                  disabled={disabled}
                />
                <RHFInput
                  name={`${baseName}.validityDays`}
                  label="Validité (jours)"
                  type="number"
                  placeholder="Ex. 7"
                  disabled={disabled}
                  description="Nombre de jours après le gain."
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
