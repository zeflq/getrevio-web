'use server';

// src/features/shortlinks/server/redis.actions.ts
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { shortlinkTargetSchema } from "../model/shortlinkSchema";

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

/** Calcule l’URL finale UNIQUEMENT à partir du place.slug (pas d’alias stocké). */
async function resolveDestinationUrl(
  baseUrl: string,
  parsedTarget: ReturnType<typeof shortlinkTargetSchema.parse>
): Promise<string | undefined> {
  if (parsedTarget.t === "place") {
    const place = await prisma.place.findUnique({
      where: { id: parsedTarget.pid },
      select: { slug: true },
    });
    if (!place?.slug) return undefined;
    return `${baseUrl}/${place.slug}`;
  }

  if (parsedTarget.t === "campaign") {
    const campaign = await prisma.campaign.findUnique({
      where: { id: parsedTarget.cid },
      select: { place: { select: { slug: true } } },
    });
    const placeSlug = campaign?.place?.slug;
    if (!placeSlug) return undefined;
    const params = new URLSearchParams({ c: parsedTarget.cid }).toString();
    return `${baseUrl}/${placeSlug}${params ? `?${params}` : ""}`;
  }

  return undefined;
}

/** Payload JSON stocké sous sl:${code} */
function buildPayload(args: {
  destinationUrl: string;
  merchantId: string;
  active: boolean;
  target: unknown;
  expiresAt?: string | null;
  themeId?: string | null;
  utm?: unknown | null;
  channel?: string | null;
}) {
  const payload: Record<string, unknown> = {
    v: 1,
    a: args.active ? 1 : 0,
    u: args.destinationUrl,
    mid: args.merchantId,
    tgt: args.target,
  };
  if (args.expiresAt) payload.ea = Math.floor(new Date(args.expiresAt).getTime() / 1000);
  if (args.themeId)   payload.th = args.themeId;
  if (args.utm)       payload.utm = args.utm;
  if (args.channel)   payload.cm = { [args.channel]: { utm: { source: args.channel } } };
  return payload;
}

export type ShortlinkRow = {
  id: string;
  code: string;
  target: unknown;
  merchantId: string;
  channel: string | null;
  themeId: string | null;
  active: boolean;
  expiresAt: string | null;
  utm: unknown | null;
};

/** CREATE -> écrit uniquement sl:${code} */
export async function onShortlinkCreated(record: ShortlinkRow) {
  try {
    const redis = getRedis();
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;

    const parsedTarget = shortlinkTargetSchema.parse(record.target);
    const destinationUrl = await resolveDestinationUrl(baseUrl, parsedTarget);
    if (!destinationUrl) return;

    const payload = buildPayload({
      destinationUrl,
      merchantId: record.merchantId,
      active: record.active,
      target: parsedTarget,
      expiresAt: record.expiresAt ?? undefined,
      themeId: record.themeId ?? undefined,
      utm: record.utm ?? undefined,
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
      target: patch.target ?? previous.target,
      channel: patch.channel ?? previous.channel,
      themeId: patch.themeId ?? previous.themeId,
      active: patch.active ?? previous.active,
      expiresAt: patch.expiresAt ?? previous.expiresAt,
      utm: patch.utm ?? previous.utm,
    };

    const parsed = shortlinkTargetSchema.parse(effective.target);
    const destinationUrl = await resolveDestinationUrl(baseUrl, parsed);

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
      target: parsed,
      expiresAt: effective.expiresAt ?? undefined,
      themeId: effective.themeId ?? undefined,
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
