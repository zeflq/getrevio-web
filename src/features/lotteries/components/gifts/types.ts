// features/lotteries/gifts/types.ts

export type GiftFormValue = {
  id: string;
  name: string; // internal name
  kind: "free_item" | "discount" | "credit" | "other";
  weight: number;
  rewardLabel: string;
  imageUrl?: string;
  minPurchaseAmount?: number | null;
  minPurchaseCurrency?: string | null;
  validityDays?: number | null;
};

export type LotteryConfigFormValues = {
  gifts: GiftFormValue[];
  noWinWeight?: number;
};

export const GIFT_TYPE_LABEL: Record<GiftFormValue["kind"], string> = {
  free_item: "Produit offert",
  discount: "Réduction",
  credit: "Crédit / bon",
  other: "Autre",
};

export function createEmptyGift(): GiftFormValue {
  return {
    id: `gift_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    kind: "free_item",
    weight: 1,
    rewardLabel: "",
    imageUrl: "",
    minPurchaseAmount: undefined,
    minPurchaseCurrency: "EUR",
    validityDays: 7,
  };
}
