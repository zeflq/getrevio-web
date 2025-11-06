import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  CampaignCreateRecord,
  CampaignRepository,
  CampaignUpdateRecord,
} from "../../application/interfaces/campaignRepository";

export class PrismaCampaignRepository implements CampaignRepository {
  constructor(private readonly client: Prisma.CampaignDelegate = prisma.campaign) {}

  async create(data: CampaignCreateRecord): Promise<void> {
    await this.client.create({
      data: {
        merchantId: data.merchantId,
        placeId: data.placeId,
        name: data.name,
        status: data.status,
        theme: data.themeId ? { connect: { id: data.themeId } } : undefined,
      },
    });
  }

  async update(data: CampaignUpdateRecord, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(data.id, tenantId ?? null);

    const patch: Prisma.CampaignUpdateInput = {};

    if (data.merchantId !== undefined) {
      patch.merchant = { connect: { id: data.merchantId } };
    }

    if (data.placeId !== undefined) {
      patch.place = { connect: { id: data.placeId } };
    }

    if (data.name !== undefined) {
      patch.name = data.name;
    }

    if (data.status !== undefined) {
      patch.status = data.status;
    }

    if (data.themeId !== undefined) {
      patch.theme = data.themeId ? { connect: { id: data.themeId } } : { disconnect: true };
    }

    if (Object.keys(patch).length === 0) {
      const existing = await this.client.findUnique({
        where: { id: data.id },
        select: { id: true },
      });
      if (!existing) {
        throw new Error("NOT_FOUND");
      }
      return;
    }

    await this.client.update({
      where: { id: data.id },
      data: patch,
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
