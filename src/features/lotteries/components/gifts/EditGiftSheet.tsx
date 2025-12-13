// features/lotteries/gifts/EditGiftSheet.tsx
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
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
import { lotteryGiftSchema } from "@/features/lotteries/model/lotterySchema";

import type { GiftFormValue } from "./types";

type EditGiftSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGift: GiftFormValue;
  onSave: (gift: GiftFormValue) => void;
  isNew: boolean;
};

export function EditGiftSheet({
  open,
  onOpenChange,
  initialGift,
  onSave,
  isNew,
}: EditGiftSheetProps) {
  const t = useTranslations("lotteries.editGiftSheet");
  const tTypes = useTranslations("lotteries.giftTypes");

  const defaultValues: GiftFormValue = React.useMemo(
    () => ({
      id: initialGift.id,
      name: initialGift.name ?? "",
      kind: initialGift.kind,
      weight: initialGift.weight ?? 0,
      rewardLabel: initialGift.rewardLabel ?? "",
      imageUrl: initialGift.imageUrl,
      minPurchaseAmount: initialGift.minPurchaseAmount,
      minPurchaseCurrency: initialGift.minPurchaseCurrency ?? "EUR",
      validityDays: initialGift.validityDays,
    }),
    [initialGift]
  );

  const methods = useForm<GiftFormValue>({
    mode: "onChange", // validation réactive
    reValidateMode: "onChange",
    defaultValues,
    resolver: zodResolver(lotteryGiftSchema) as Resolver<GiftFormValue>,
  });

  const {
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
    register,
  } = methods;

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // on ferme → on reset sur la valeur initiale
      reset(defaultValues);
    }
    onOpenChange(next);
  };

  const handleSubmit = (values: GiftFormValue) => {
    onSave(values);
  };

  const kind = watch("kind");

  return (
    <SheetForm<GiftFormValue>
      open={open}
      title={isNew ? t("titleAdd") : t("titleEdit")}
      description={t("description")}
      methods={methods}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isBusy={isSubmitting}
      isReady={true}
      onCancel={() => handleOpenChange(false)}
    >
      {/* Row 1 : name / type / weight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RHFInput
          name="name"
          label={t("internalName")}
          placeholder={t("internalNamePlaceholder")}
          requiredStar
        />

        <div className="gap-2 flex flex-col md:mx-auto">
          <Label>{t("type")}</Label>
          <Select
            value={kind}
            onValueChange={(value) =>
              setValue("kind", value as GiftFormValue["kind"], {
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
          name="weight"
          label={t("weight")}
          type="number"
          min={0}
          placeholder="0"
          requiredStar
          description={t("weightHelper")}
        />
      </div>

      {/* Row 2 : label uniquement (URL cachée pour l’instant) */}
      <div className="grid grid-cols-1 gap-3">
        <RHFInput
          name="rewardLabel"
          label={t("displayLabel")}
          placeholder={t("displayLabelPlaceholder")}
          requiredStar
        />

        {/* 
        // 🔒 Futur : image URL + upload
        // <div className="space-y-1">
        //   <Label htmlFor="gift-image">Image (URL)</Label>
        //   <Input
        //     id="gift-image"
        //     {...register("imageUrl")}
        //     placeholder="https://…"
        //   />
        // </div>
        */}
      </div>

      {/* Row 3 : min amount / validity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RHFInput
          name="minPurchaseAmount"
          label={t("minAmount")}
          type="number"
          min={0}
          placeholder={t("minAmountPlaceholder")}
        />

        <RHFInput
          name="validityDays"
          label={t("validity")}
          type="number"
          min={0}
          placeholder={t("validityPlaceholder")}
          description={t("validityHelper")}
        />

        {/* 
        // 🔒 Futur : currency input
        // <div className="space-y-1">
        //   <Label htmlFor="gift-currency">Currency</Label>
        //   <Input
        //     id="gift-currency"
        //     {...register("minPurchaseCurrency")}
        //   />
        // </div>
        */}
      </div>
    </SheetForm>
  );
}
