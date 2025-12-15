// features/lotteries/gifts/EditGiftSheet.tsx
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { SheetForm } from "@/components/form/SheetForm";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RHFInput } from "@/components/form/controls";
import type { LotteryConfigFormValues } from "@/features/lotteries/model/lotterySchema";

type EditGiftSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftIndex: number;
  isNew: boolean;
  onSaveClicked?: () => void; // Called when Save button clicked (before close)
};

export function EditGiftSheet({
  open,
  onOpenChange,
  giftIndex,
  isNew,
  onSaveClicked,
}: EditGiftSheetProps) {
  const t = useTranslations("lotteries.editGiftSheet");
  const tTypes = useTranslations("lotteries.giftTypes");

  const form = useFormContext<LotteryConfigFormValues>();
  const { setValue, watch } = form;

  const handleSubmit = React.useCallback(() => {
    onSaveClicked?.(); // Notify parent that Save was clicked
    onOpenChange(false);
  }, [onSaveClicked, onOpenChange]);

  const fieldPrefix = `gifts.${giftIndex}` as const;
  const kind = watch(`${fieldPrefix}.kind`);

  return (
    <SheetForm<LotteryConfigFormValues>
      open={open}
      title={isNew ? t("titleAdd") : t("titleEdit")}
      description={t("description")}
      methods={form}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      isBusy={form.formState.isSubmitting}
      isReady={true}
      onCancel={() => onOpenChange(false)}
      // IMPORTANT: skipFormProvider=true because we use the parent lottery form
      // via useFormContext() above. Same pattern as EditorSheetCard for landing addons.
      // See: /docs/SheetForm-usage-guide.md
      skipFormProvider={true}
    >
      {/* Row 1 : name / type / weight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RHFInput
          name={`${fieldPrefix}.name`}
          label={t("internalName")}
          placeholder={t("internalNamePlaceholder")}
          requiredStar
        />

        <div className="gap-2 flex flex-col md:mx-auto">
          <Label>{t("type")}</Label>
          <Select
            value={kind}
            onValueChange={(value) =>
              setValue(`${fieldPrefix}.kind` as any, value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free_item">{tTypes("free_item")}</SelectItem>
              <SelectItem value="discount">{tTypes("discount")}</SelectItem>
              <SelectItem value="credit">{tTypes("credit")}</SelectItem>
              <SelectItem value="other">{tTypes("other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <RHFInput
          name={`${fieldPrefix}.weight`}
          label={t("weight")}
          type="number"
          min={0}
          placeholder="0"
          requiredStar
          description={t("weightHelper")}
        />
      </div>

      {/* Row 2 : label uniquement (URL cachée pour l'instant) */}
      <div className="grid grid-cols-1 gap-3">
        <RHFInput
          name={`${fieldPrefix}.rewardLabel`}
          label={t("displayLabel")}
          placeholder={t("displayLabelPlaceholder")}
          requiredStar
        />
      </div>

      {/* Row 3 : min amount / validity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RHFInput
          name={`${fieldPrefix}.minPurchaseAmount`}
          label={t("minAmount")}
          type="number"
          min={0}
          placeholder={t("minAmountPlaceholder")}
        />

        <RHFInput
          name={`${fieldPrefix}.validityDays`}
          label={t("validity")}
          type="number"
          min={0}
          placeholder={t("validityPlaceholder")}
          description={t("validityHelper")}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("activationNote")}
      </p>
    </SheetForm>
  );
}
