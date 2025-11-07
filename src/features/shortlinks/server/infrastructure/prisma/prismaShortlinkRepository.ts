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
    const utmColumns = extractUtmColumns(data);

    const createPayload: Prisma.ShortlinkUncheckedCreateInput = {
      merchantId: data.merchantId,
      code: data.code,
      target: data.target,
      targetType,
      campaignId,
      placeId,
      channel: data.channel ?? null,
      active: data.active,
      expiresAt: data.expiresAt ?? null,
    };

    if (utmColumns.utmSource !== undefined) createPayload.utmSource = utmColumns.utmSource;
    if (utmColumns.utmMedium !== undefined) createPayload.utmMedium = utmColumns.utmMedium;
    if (utmColumns.utmCampaign !== undefined) createPayload.utmCampaign = utmColumns.utmCampaign;
    if (utmColumns.utmTerm !== undefined) createPayload.utmTerm = utmColumns.utmTerm;
    if (utmColumns.utmContent !== undefined) createPayload.utmContent = utmColumns.utmContent;

    const created = await this.client.create({
      data: createPayload,
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

    const patch: Prisma.ShortlinkUncheckedUpdateInput = {};

    if (data.code !== undefined) {
      patch.code = data.code;
    }

    if (data.target !== undefined) {
      patch.target = data.target;

      const { targetType, campaignId, placeId } = resolveTargetMetadata(data.target);
      patch.targetType = targetType;
      patch.campaignId = campaignId;
      patch.placeId = placeId;
    }

    if (data.channel !== undefined) {
      patch.channel = data.channel ?? null;
    }

    if (data.active !== undefined) {
      patch.active = data.active;
    }

    if (data.expiresAt !== undefined) {
      patch.expiresAt = data.expiresAt ?? null;
    }

    if (data.merchantId !== undefined) {
      patch.merchantId = data.merchantId;
    }

    const utmColumns = extractUtmColumns(data);
    if (utmColumns.utmSource !== undefined) patch.utmSource = utmColumns.utmSource;
    if (utmColumns.utmMedium !== undefined) patch.utmMedium = utmColumns.utmMedium;
    if (utmColumns.utmCampaign !== undefined) patch.utmCampaign = utmColumns.utmCampaign;
    if (utmColumns.utmTerm !== undefined) patch.utmTerm = utmColumns.utmTerm;
    if (utmColumns.utmContent !== undefined) patch.utmContent = utmColumns.utmContent;

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
      campaignId: normalizeId(target.cid),
      placeId: normalizeId(target.pid),
    };
  }

  return {
    targetType: "place",
    campaignId: null,
    placeId: normalizeId(target.pid),
  };
}

type UTMColumns = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

type UTMInput = UTMColumns & {
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    term?: string | null;
    content?: string | null;
  } | null;
};

function extractUtmColumns(input: UTMInput): UTMColumns {
  const fromObject = input.utm ?? undefined;

  return {
    utmSource: pickUtmValue(input.utmSource, fromObject?.source),
    utmMedium: pickUtmValue(input.utmMedium, fromObject?.medium),
    utmCampaign: pickUtmValue(input.utmCampaign, fromObject?.campaign),
    utmTerm: pickUtmValue(input.utmTerm, fromObject?.term),
    utmContent: pickUtmValue(input.utmContent, fromObject?.content),
  };
}

function pickUtmValue(direct?: string | null, nested?: string | null): string | null | undefined {
  if (direct !== undefined) {
    return normalizeUtmValue(direct);
  }
  if (nested !== undefined) {
    return normalizeUtmValue(nested);
  }
  return undefined;
}

function normalizeUtmValue(value?: string | null): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeId(value?: string | null): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
