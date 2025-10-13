// src/features/shortlinks/server/actions.ts
"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { createServerActions } from "@/lib/helpers/createServerActions";
import { actionUser } from "@/lib/actionUser";
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

// ---------- schemas ----------
const deleteSchema = z.object({ id: z.string() });

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
const actions = await createServerActions({
  actionClient: actionUser,
  delegate: prisma.shortlink,

  // IMPORTANT: scope by id + tenant
  whereByIdTenant: (id: string, tenantId?: string) => ({
    id,
    ...(tenantId ? { merchantId: tenantId } : {}),
  }),

  // On lit l'ancienne ligne pour les hooks update/delete
  getById: (id: string, tenantId?: string) =>
    prisma.shortlink.findFirst({
      where: tenantId ? { id, merchantId: tenantId } : { id },
      select: {
        id: true,
        code: true,
        target: true,
        merchantId: true,
        channel: true,
        themeId: true,
        active: true,
        expiresAt: true,
        utm: true,
      },
    }),

  createSchema: shortlinkCreateSchema,
  updateSchema: shortlinkUpdateSchema.extend({ id: z.string() }),
  deleteSchema,

  getTenantId: (ctx) => ctx.user?.tenantId,
  revalidateTag: "shortlinks",

  beforeCreate: async (input) => {
    const code = await ensureUniqueCode((input as any).code);
    return { ...input, code };
  },

  // On retourne ce qui est utile et suffisant pour Redis.create
  selectAfterCreate: {
    id: true,
    code: true,
    target: true,
    merchantId: true,
    channel: true,
    themeId: true,
    active: true,
    expiresAt: true,
    utm: true,
  },

  // 🔴 Delegation Redis
  afterCreate: async ({ record }) => {
    await onShortlinkCreated(record as ShortlinkRow);
  },
  afterUpdate: async ({ previous, inputPatch }) => {
    await onShortlinkUpdated(previous as ShortlinkRow, inputPatch as Partial<ShortlinkRow>);
  },
  afterDelete: async ({ previous }) => {
    await onShortlinkDeleted(previous as ShortlinkRow);
  },
});

export const createShortlinkAction = actions.createAction;
export const updateShortlinkAction = actions.updateAction;
export const deleteShortlinkAction = actions.deleteAction;
