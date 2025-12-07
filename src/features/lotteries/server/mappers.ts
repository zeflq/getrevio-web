import type { LotteryContactMethod, LotteryCooldown, Prisma } from "@/generated/client";

import type { LotteryGiftFormValue } from "@/features/lotteries/model/lotterySchema";

export const lotteryConfigSelect = {
  id: true,
  merchantId: true,
  name: true,
  enabled: true,
  playLimitPerUser: true,
  cooldown: true,
  noWinWeight: true,
  guaranteeWinOnFirstPlay: true,
  contactMethod: true,
  gifts: true,
  createdAt: true,
  updatedAt: true,
  merchant: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.LotteryConfigSelect;

export type LotteryConfigListDTO = {
  id: string;
  merchantId: string;
  merchantName?: string | null;
  name: string;
  enabled: boolean;
  playLimitPerUser: number;
  cooldown: LotteryCooldown;
  noWinWeight: number;
  guaranteeWinOnFirstPlay: boolean;
  contactMethod: LotteryContactMethod;
  createdAt: string;
  updatedAt: string;
  gifts: LotteryGiftFormValue[];
};

export type LotteryConfigDetailDTO = LotteryConfigListDTO;

export const mapLotteryConfigRowToList = (
  row: Prisma.LotteryConfigGetPayload<{ select: typeof lotteryConfigSelect }>
): LotteryConfigListDTO => ({
  id: row.id,
  merchantId: row.merchantId,
  merchantName: row.merchant?.name ?? null,
  name: row.name,
  enabled: row.enabled,
  playLimitPerUser: row.playLimitPerUser,
  cooldown: row.cooldown,
  noWinWeight: row.noWinWeight,
  guaranteeWinOnFirstPlay: row.guaranteeWinOnFirstPlay,
  contactMethod: row.contactMethod,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  gifts: [],
});

export const mapLotteryConfigRowToDetail = (
  row: Prisma.LotteryConfigGetPayload<{ select: typeof lotteryConfigSelect }>
): LotteryConfigDetailDTO => {
  const base = mapLotteryConfigRowToList(row);

  const gifts: LotteryGiftFormValue[] =
    Array.isArray(row.gifts) ? (row.gifts as LotteryGiftFormValue[]) : [];

  return {
    ...base,
    gifts,
  };
}
