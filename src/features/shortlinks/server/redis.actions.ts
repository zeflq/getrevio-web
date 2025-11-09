'use server';

// src/features/shortlinks/server/redis.actions.ts
import { getRedis } from "@/lib/redis";
import { shortlinkTargetSchema } from "../model/shortlinkSchema";
import { ResolveDestinationUrlUseCase } from "@/features/landings/server/application/usecases/resolveDestinationUrlUseCase";
import { PrismaLandingQueryRepository } from "@/features/landings/server/infrastructure/prisma/prismaLandingQueryRepository";

const codeKeyOf = (code: string) => `sl:${code}`;

function secondsUntil(dateIso: string) {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

function getBaseUrl(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_SHORT_URL_BASE ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "";
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

const landingQueryRepository = new PrismaLandingQueryRepository();
const resolveDestinationUrlUseCase = new ResolveDestinationUrlUseCase(landingQueryRepository);

async function resolveDestinationUrl(baseUrl: string, landingId: string | null): Promise<string | undefined> {
  if (!landingId) return undefined;
  return resolveDestinationUrlUseCase.execute({ 
    landingId,
    baseUrl 
  });
}
function buildPayload(args: {
  destinationUrl: string;
  merchantId: string;
  active: boolean;
  landingId: string;                  // always required now
  campaignId?: string | null;
  placeId?: string | null;
  expiresAt?: string | null;
  utm?: Record<string, unknown> | null;
  channel?: string | null;
}) {
  if (!args.landingId) {
    throw new Error("buildPayload: landingId is required.");
  }

  // Store only the type in tgt, keep IDs at top level
  // const tgt = shortlinkTargetSchema.parse({
  //   t: args.campaignId ? "campaign" : "place"
  // });

  const payload: Record<string, unknown> = {
    v: 1,
    a: args.active ? 1 : 0,
    u: args.destinationUrl,          // the shortlink's public URL (debug/analytics)
    mid: args.merchantId,
    lid: args.landingId,             // canonical redirect target
    //tgt,                              // context type only (campaign/place)
  };

  // Add campaignId and placeId at top level if they exist
  if (args.campaignId) {
    payload.cid = args.campaignId;
  }
  if (args.placeId) {
    payload.pid = args.placeId;
  }

  // Expiry (epoch seconds) if valid and in the future
  if (args.expiresAt) {
    const ts = Date.parse(args.expiresAt);
    if (!Number.isNaN(ts) && ts > Date.now()) {
      payload.ea = Math.floor(ts / 1000);
    }
  }

  // UTM bundle (omit if empty)
  if (args.utm && Object.keys(args.utm).length > 0) {
    payload.utm = args.utm;
  }

  // Simple channel flag
  if (args.channel) {
    payload.channel = args.channel;
  }

  return payload;
}



export type ShortlinkRow = {
  id: string;
  code: string;
  merchantId: string;
  landingId: string;
  campaignId: string | null;
  placeId: string | null;
  channel: string | null;
  active: boolean;
  expiresAt: string | null;
  utm?: Record<string, unknown> | null;
};

/** CREATE -> écrit uniquement sl:${code} */
export async function onShortlinkCreated(record: ShortlinkRow) {
  try {
    const redis = getRedis();
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;

    const destinationUrl = await resolveDestinationUrl(baseUrl, record.landingId ?? null);
    if (!destinationUrl) return;

    const payload = buildPayload({
      destinationUrl,
      merchantId: record.merchantId,
      active: record.active,
      landingId: record.landingId,
      campaignId: record.campaignId ?? null,
      placeId: record.placeId ?? null,
      expiresAt: record.expiresAt ?? undefined,
      utm: record.utm ?? null,
      channel: record.channel ?? undefined,
    });

    const m = redis.multi();
    const key = codeKeyOf(record.code);

    m.set(key, JSON.stringify(payload));
    if (record.expiresAt) {
      const ttl = secondsUntil(record.expiresAt);
      if (ttl > 0) m.expire(key, ttl);
    }

    await m.exec();
  } catch (error) {
    console.error("[onShortlinkCreated] Redis write failed", error);
  }
}

/** UPDATE -> met à jour sl:${code} et supprime l’ancienne clé si le code a changé */
export async function onShortlinkUpdated(previous: ShortlinkRow, patch: Partial<ShortlinkRow>) {
  if (!previous) return;
  try {
    const redis = getRedis();
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;

    const effective: ShortlinkRow = {
      ...previous,
      ...patch,
      code: patch.code ?? previous.code,
      landingId: patch.landingId ?? previous.landingId,
      campaignId: patch.campaignId ?? previous.campaignId,
      placeId: patch.placeId ?? previous.placeId,
      channel: patch.channel ?? previous.channel,
      active: patch.active ?? previous.active,
      expiresAt: patch.expiresAt ?? previous.expiresAt,
      utm: patch.utm ?? previous.utm,
    };

    const destinationUrl = await resolveDestinationUrl(baseUrl, effective.landingId ?? null);

    const m = redis.multi();

    // si le code change, purge l’ancienne clé
    if (effective.code !== previous.code) {
      m.del(codeKeyOf(previous.code));
    }

    if (!destinationUrl) {
      // si plus résolvable -> supprime la clé actuelle/ancienne
      m.del(codeKeyOf(effective.code));
      await m.exec();
      return;
    }

    const payload = buildPayload({
    destinationUrl,
    merchantId: effective.merchantId,
    active: effective.active,
    landingId: effective.landingId ?? null,
    campaignId: effective.campaignId ?? null,
    placeId: effective.placeId ?? null,
    expiresAt: effective.expiresAt ?? undefined,
    utm: effective.utm ?? undefined,
    channel: effective.channel ?? undefined,
  });

    const key = codeKeyOf(effective.code);
    m.set(key, JSON.stringify(payload));
    if (effective.expiresAt) {
      const ttl = secondsUntil(effective.expiresAt);
      if (ttl > 0) m.expire(key, ttl);
    }

    await m.exec();
  } catch (e) {
    console.error("[onShortlinkUpdated] Redis sync failed", e);
  }
}

/** DELETE -> supprime sl:${code} */
export async function onShortlinkDeleted(previous: ShortlinkRow) {
  if (!previous) return;
  try {
    const redis = getRedis();
    await redis.del(codeKeyOf(previous.code));
  } catch (e) {
    console.error("[onShortlinkDeleted] Redis purge failed", e);
  }
}
