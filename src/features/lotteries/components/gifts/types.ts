// features/lotteries/gifts/types.ts

export type GiftFormValue = {
  id: string;
  name: string;
  kind: "free_item" | "discount" | "credit" | "other";
  weight: number;
  rewardLabel: string;
  imageUrl?: string;
  minPurchaseAmount?: number;
  minPurchaseCurrency?: string;
  validityDays?: number;
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
