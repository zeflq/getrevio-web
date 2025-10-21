// src/features/shortlinks/server/actions.ts
"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/actionUser";
import { createServerActions } from "@/server/core/actions/createServerActions";
import {
  shortlinkCreateSchema,
  shortlinkUpdateSchema,
} from "../model/shortlinkSchema";
import {
  onShortlinkCreated,
  onShortlinkUpdated,
  onShortlinkDeleted,
  type ShortlinkRow,
} from "./redis.actions";
import { shortlinkRepo, shortlinkSelect } from "./repo";
import type { ShortlinkSelectRow } from "./mappers";

// ---------- schemas ----------
const deleteSchema = z.object({ id: z.string() });
const shortlinkUpdateWithIdSchema = shortlinkUpdateSchema.extend({ id: z.string() });

// ---------- code generator ----------
const CODE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_CODE_LENGTH = 8;
const MAX_CODE_ATTEMPTS = 10;

const randomCode = (length = DEFAULT_CODE_LENGTH) => {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
};

const ensureUniqueCode = async (preferred?: string | null) => {
  const trimmedPreferred = preferred?.trim();
  if (trimmedPreferred) {
    const existing = await prisma.shortlink.findUnique({
      where: { code: trimmedPreferred },
      select: { id: true },
    });
    if (existing) throw new Error("SHORTLINK_CODE_ALREADY_EXISTS");
    return trimmedPreferred;
  }
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const candidate = randomCode();
    const existing = await prisma.shortlink.findUnique({
      where: { code: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("SHORTLINK_CODE_GENERATION_FAILED");
};

// ---------- actions ----------
const toRedisRow = (row: ShortlinkSelectRow | null | undefined): ShortlinkRow | null => {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    target: row.target,
    merchantId: row.merchantId,
    channel: row.channel ?? null,
    themeId: row.themeId ?? null,
    active: row.active,
    expiresAt: row.expiresAt
      ? row.expiresAt instanceof Date
        ? row.expiresAt.toISOString()
        : (row.expiresAt as unknown as string)
      : null,
    utm: row.utm ?? null,
  };
};

const normalizePatchForRedis = (
  patch: Omit<z.output<typeof shortlinkUpdateWithIdSchema>, "id">
): Partial<ShortlinkRow> => {
  const result: Partial<ShortlinkRow> = {};
  if (Object.prototype.hasOwnProperty.call(patch, "code") && patch.code !== undefined) {
    result.code = patch.code;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "target") && patch.target !== undefined) {
    result.target = patch.target;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "channel") && patch.channel !== undefined) {
    result.channel = patch.channel ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "themeId") && patch.themeId !== undefined) {
    result.themeId = patch.themeId ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "active") && patch.active !== undefined) {
    result.active = patch.active;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "expiresAt") && patch.expiresAt !== undefined) {
    result.expiresAt = patch.expiresAt
      ? patch.expiresAt instanceof Date
        ? patch.expiresAt.toISOString()
        : (patch.expiresAt as unknown as string)
      : null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "utm") && patch.utm !== undefined) {
    result.utm = patch.utm ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "merchantId") && patch.merchantId !== undefined) {
    result.merchantId = patch.merchantId;
  }
  return result;
};

const actions = await createServerActions({
  actionClient: actionUser,
  repo: shortlinkRepo,

  // IMPORTANT: scope by id + tenant
  whereByIdTenant: (id: string, tenantId?: string) => ({
    id,
    ...(tenantId ? { merchantId: tenantId } : {}),
  }),

  // On lit l'ancienne ligne pour les hooks update/delete
  getById: (id: string, tenantId?: string) =>
    prisma.shortlink.findFirst({
      where: tenantId ? { id, merchantId: tenantId } : { id },
      select: shortlinkSelect,
    }) as Promise<ShortlinkSelectRow | null>,

  createSchema: shortlinkCreateSchema,
  updateSchema: shortlinkUpdateWithIdSchema,
  deleteSchema,

  getTenantId: (ctx) => ctx.user?.tenantId,
  tenantKey: "merchantId",
  revalidateTag: "shortlinks",

  beforeCreate: async (input) => {
    const code = await ensureUniqueCode((input as any).code);
    return { ...input, code };
  },

  selectAfterCreate: shortlinkSelect,
  selectAfterUpdate: shortlinkSelect,

  // 🔴 Delegation Redis
  afterCreate: async ({ record }) => {
    const redisRow = toRedisRow(record as ShortlinkSelectRow);
    if (redisRow) await onShortlinkCreated(redisRow);
  },
  afterUpdate: async ({ previous, inputPatch }) => {
    const prevRow = toRedisRow(previous as ShortlinkSelectRow | null | undefined);
    if (!prevRow) return;
    const patch = normalizePatchForRedis(
      inputPatch as Omit<z.output<typeof shortlinkUpdateWithIdSchema>, "id">
    );
    await onShortlinkUpdated(prevRow, patch);
  },
  afterDelete: async ({ previous }) => {
    const prevRow = toRedisRow(previous as ShortlinkSelectRow | null | undefined);
    if (prevRow) await onShortlinkDeleted(prevRow);
  },
});

export const createShortlinkAction = actions.createAction;
export const updateShortlinkAction = actions.updateAction;
export const deleteShortlinkAction = actions.deleteAction;
