import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  LandingCreateRecord,
  LandingRepository,
  LandingUpdateRecord,
} from "../../application/interfaces/landingRepository";

export class PrismaLandingRepository implements LandingRepository {
  constructor(
    private readonly client: Prisma.LandingDelegate = prisma.landing
  ) {}

  async create(data: LandingCreateRecord): Promise<string> {
    const created = await this.client.create({
      data: {
        merchantId: data.merchantId,
        name: data.name,
        slug: data.slug,
        templateId: data.templateId ?? null,
        themeId: data.themeId ?? null,

        // IMPORTANT : pas de `undefined` ici.
        contentDraft:
          data.contentDraft === undefined
            ? Prisma.JsonNull
            : (JSON.parse(
                JSON.stringify(data.contentDraft)
              ) as Prisma.InputJsonValue),

        // Ici ton champ est certainement un JSON nullable (NullableJsonNullValueInput)
        contentPublished:
          data.contentPublished === undefined
            ? Prisma.JsonNull
            : (JSON.parse(
                JSON.stringify(data.contentPublished)
              ) as Prisma.InputJsonValue),

        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    return created.id;
  }

  async update(data: LandingUpdateRecord, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(data.id, tenantId ?? null);

    const patch: Prisma.LandingUpdateInput = {};

    if (data.name !== undefined) {
      patch.name = data.name;
    }

    if (data.contentDraft !== undefined) {
      // même logique : JsonNull pour “vider” le JSON non nullable
      patch.contentDraft =
        data.contentDraft === null
          ? Prisma.JsonNull
          : (JSON.parse(
              JSON.stringify(data.contentDraft)
            ) as Prisma.InputJsonValue);
    }

    if (data.contentPublished !== undefined) {
      patch.contentPublished =
        data.contentPublished === null
          ? Prisma.DbNull
          : (JSON.parse(
              JSON.stringify(data.contentPublished)
            ) as Prisma.InputJsonValue);
    }

    if (data.templateId !== undefined) {
      patch.templateId = data.templateId ?? null;
    }

    if (data.themeId) {
      patch.theme =  { connect: { id: data.themeId } };
    }

    if (data.merchantId !== undefined) {
      patch.merchant = { connect: { id: data.merchantId } };
    }

    if (data.publishedAt !== undefined) {
      patch.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
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
