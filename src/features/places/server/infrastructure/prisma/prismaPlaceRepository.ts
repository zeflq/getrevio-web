import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  PlaceCreateRecord,
  PlaceRepository,
  PlaceUpdateRecord,
} from "../../application/interfaces/placeRepository";

export class PrismaPlaceRepository implements PlaceRepository {
  constructor(private readonly client: Prisma.PlaceDelegate = prisma.place) {}

  async create(data: PlaceCreateRecord): Promise<string> {
    const created = await this.client.create({
      data: {
        merchantId: data.merchantId,
        localName: data.localName,
        address: data.address ?? null,
      },
    });

    return created.id;
  }

  async update(data: PlaceUpdateRecord, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(data.id, tenantId ?? null);

    const patch: Prisma.PlaceUpdateInput = {};

    if (data.localName !== undefined) {
      patch.localName = data.localName;
    }

    if (data.address !== undefined) {
      patch.address = data.address;
    }

    if (data.merchantId !== undefined) {
      patch.merchant = { connect: { id: data.merchantId } };
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
