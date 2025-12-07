import type { LotteryContactMethod, LotteryCooldown } from "@/generated/client";

import type { LotteryGiftFormValue } from "@/features/lotteries/model/lotterySchema";

export type LotteryConfigCreateRecord = {
  merchantId: string;
  name: string;
  enabled: boolean;
  playLimitPerUser: number;
  cooldown: LotteryCooldown;
  noWinWeight: number;
  guaranteeWinOnFirstPlay: boolean;
  contactMethod: LotteryContactMethod;
  gifts: LotteryGiftFormValue[];
};

export type LotteryConfigUpdateRecord = LotteryConfigCreateRecord & {
  id: string;
};

export interface LotteryConfigRepository {
  create(record: LotteryConfigCreateRecord): Promise<string>;
  update(record: LotteryConfigUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
