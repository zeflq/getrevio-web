import { Prisma } from "@/generated/client";

import prisma from "@/lib/prisma";
import type {
  LotteryConfigCreateRecord,
  LotteryConfigRepository,
  LotteryConfigUpdateRecord,
} from "@/features/lotteries/server/application/interfaces/lotteryConfigRepository";

export class PrismaLotteryConfigRepository implements LotteryConfigRepository {
  constructor(private readonly client: Prisma.LotteryConfigDelegate = prisma.lotteryConfig) {}

  async create(record: LotteryConfigCreateRecord): Promise<string> {
    const created = await this.client.create({
      data: {
        merchantId: record.merchantId,
        name: record.name,
        enabled: record.enabled,
        playLimitPerUser: record.playLimitPerUser,
        cooldown: record.cooldown,
        noWinWeight: record.noWinWeight,
        guaranteeWinOnFirstPlay: record.guaranteeWinOnFirstPlay,
        gifts: record.gifts,
      },
    });

    return created.id;
  }

  async update(record: LotteryConfigUpdateRecord, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(record.id, tenantId ?? null);

    await this.client.update({
      where: { id: record.id },
      data: {
        merchantId: record.merchantId,
        name: record.name,
        enabled: record.enabled,
        playLimitPerUser: record.playLimitPerUser,
        cooldown: record.cooldown,
        noWinWeight: record.noWinWeight,
        guaranteeWinOnFirstPlay: record.guaranteeWinOnFirstPlay,
        gifts: record.gifts,
      },
    });
  }

  async delete(id: string, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(id, tenantId ?? null);
    await this.client.delete({ where: { id } });
  }

  private async ensureTenant(id: string, tenantId: string | null) {
    if (!tenantId) return;
    const existing = await this.client.findFirst({
      where: {
        id,
        merchantId: tenantId,
      },
      select: { id: true },
    });
    if (!existing) {
      throw new Error("FORBIDDEN");
    }
  }
}
