/**
 * Shared types for lottery-related addons
 * Used by: lotteryAddon, sloteBanner, winningDrawerAddon
 */

export type GiftSnapshot = {
  rewardLabel?: string;
  minPurchaseAmount?: number;
  minPurchaseCurrency?: string;
  validityDays?: number;
  [key: string]: unknown;
};

export type WinData = {
  winId: string;
  giftSnapshot?: GiftSnapshot;
  contactMethod?: "email" | "sms";
};

export type LotteryResultPayload =
  | {
      status: "win";
      win: WinData;
    }
  | { status: "nowin" }
  | { status: "ineligible"; reason?: string }
  | { status: "error"; reason?: string };

export type ContactPayload = {
  email?: string;
  phone?: string;
};

// Event payload types for type-safe emit/on
export type LotteryRevealWinPayload = WinData;
