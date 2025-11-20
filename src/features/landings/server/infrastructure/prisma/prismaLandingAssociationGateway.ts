import prisma from "@/lib/prisma";

import type {
  LandingAssociationGateway,
  LandingAssociationTarget,
} from "../../application/interfaces/landingAssociationGateway";
import { Prisma } from "@prisma/client";

export class PrismaLandingAssociationGateway implements LandingAssociationGateway {
  constructor(
    private readonly placeClient: Prisma.PlaceDelegate = prisma.place,
    private readonly campaignClient: Prisma.CampaignDelegate = prisma.campaign
  ) {}

  async attach(
    target: LandingAssociationTarget,
    landingId: string,
    tenantId?: string | null
  ): Promise<void> {
    await this.clearExisting(landingId, tenantId ?? undefined);

    if (target.type === "place") {
      const where: Prisma.PlaceWhereInput = { id: target.placeId };
      if (tenantId) {
        where.merchantId = tenantId;
      }

      const result = await this.placeClient.updateMany({
        where,
        data: { landingId },
      });

      if (result.count === 0) {
        throw new Error("LANDING_ATTACH_TARGET_NOT_FOUND");
      }
      return;
    }

    const where: Prisma.CampaignWhereInput = { id: target.campaignId };
    if (tenantId) {
      where.merchantId = tenantId;
    }

    const result = await this.campaignClient.updateMany({
      where,
      data: { landingId },
    });

    if (result.count === 0) {
      throw new Error("LANDING_ATTACH_TARGET_NOT_FOUND");
    }
  }

  private async clearExisting(landingId: string, tenantId?: string) {
    const whereExtras = tenantId ? { merchantId: tenantId } : {};

    await Promise.all([
      this.placeClient.updateMany({
        where: {
          landingId,
          ...whereExtras,
        },
        data: { landingId: null },
      }),
      this.campaignClient.updateMany({
        where: {
          landingId,
          ...whereExtras,
        },
        data: { landingId: null },
      }),
    ]);
  }
}

