import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import type { ShortlinkTargetType } from "@/types/domain";

import type {
  ShortlinkCreateRecord,
  ShortlinkMutationRepository,
  ShortlinkUpdateRecord,
} from "../../application/interfaces/shortlinkRepository";
import { shortlinkSelect } from "./shortlinkSelects";
import { mapShortlinkRow } from "../../mappers";

export class PrismaShortlinkRepository implements ShortlinkMutationRepository {
  constructor(private readonly client: Prisma.ShortlinkDelegate = prisma.shortlink) {}

  async isCodeAvailable(code: string): Promise<boolean> {
    const existing = await this.client.findUnique({
      where: { code },
      select: { id: true },
    });
    return !existing;
  }

  async findById(id: string, tenantId?: string | null) {
    const row = await this.client.findFirst({
      where: tenantId ? { id, merchantId: tenantId } : { id },
      select: shortlinkSelect,
    });
    return row ? mapShortlinkRow(row) : null;
  }

  async create(data: ShortlinkCreateRecord) {
    const { targetType, campaignId, placeId } = resolveTargetMetadata(data.target);

    const created = await this.client.create({
      data: {
        merchantId: data.merchantId,
        code: data.code,
        target: data.target,
        targetType,
        campaignId,
        placeId,
        channel: data.channel ?? null,
        themeId: data.themeId ?? null,
        active: data.active,
        expiresAt: data.expiresAt ?? null,
        utm: data.utm ?? null,
      },
      select: shortlinkSelect,
    });

    return mapShortlinkRow(created);
  }

  async update(data: ShortlinkUpdateRecord, tenantId?: string | null) {
    const previousRow = await this.client.findFirst({
      where: tenantId ? { id: data.id, merchantId: tenantId } : { id: data.id },
      select: shortlinkSelect,
    });

    if (!previousRow) {
      throw new Error("NOT_FOUND");
    }

    const patch: Prisma.ShortlinkUpdateInput = {};

    if (data.code !== undefined) {
      patch.code = data.code;
    }

    if (data.target !== undefined) {
      patch.target = data.target;

      const { targetType, campaignId, placeId } = resolveTargetMetadata(data.target);
      patch.targetType = targetType;
      patch.campaign = campaignId
        ? { connect: { id: campaignId } }
        : { disconnect: true };

      patch.place = placeId
        ? { connect: { id: placeId } }
        : { disconnect: true };
        }

    if (data.channel !== undefined) {
      patch.channel = data.channel ?? null;
    }

    if (data.themeId !== undefined) {
      patch.theme = data.themeId ? { connect: { id: data.themeId } } : { disconnect: true };
    }

    if (data.active !== undefined) {
      patch.active = data.active;
    }

    if (data.expiresAt !== undefined) {
      patch.expiresAt = data.expiresAt ?? null;
    }

    if (data.utm !== undefined) {
      patch.utm = data.utm ?? null;
    }

    if (data.merchantId !== undefined) {
      patch.merchant = { connect: { id: data.merchantId } };
    }

    const updatedRow = await this.client.update({
      where: { id: data.id },
      data: patch,
      select: shortlinkSelect,
    });

    return {
      previous: mapShortlinkRow(previousRow),
      current: mapShortlinkRow(updatedRow),
    };
  }

  async delete(id: string, tenantId?: string | null) {
    const existing = await this.client.findFirst({
      where: tenantId ? { id, merchantId: tenantId } : { id },
      select: shortlinkSelect,
    });

    if (!existing) {
      return null;
    }

    await this.client.delete({ where: { id } });

    return mapShortlinkRow(existing);
  }
}

function resolveTargetMetadata(target: ShortlinkCreateRecord["target"]): {
  targetType: ShortlinkTargetType;
  campaignId: string | null;
  placeId: string | null;
} {
  if (target.t === "campaign") {
    return {
      targetType: "campaign",
      campaignId: target.cid,
      placeId: target.pid ?? null,
    };
  }

  return {
    targetType: "place",
    campaignId: null,
    placeId: target.pid,
  };
}
