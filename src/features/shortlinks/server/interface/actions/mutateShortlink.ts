"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { shortlinkUpdateSchema } from "@/features/shortlinks/model/shortlinkSchema";

import { PrismaShortlinkRepository } from "../../infrastructure/prisma/prismaShortlinkRepository";
import { UpdateShortlinkUseCase } from "../../application/usecases/updateShortlinkUseCase";
import { DeleteShortlinkUseCase } from "../../application/usecases/deleteShortlinkUseCase";
import { onShortlinkUpdated, onShortlinkDeleted } from "../../redis.actions";

const repository = new PrismaShortlinkRepository();
const updateUseCase = new UpdateShortlinkUseCase(repository);
const deleteUseCase = new DeleteShortlinkUseCase(repository);

const updateSchema = shortlinkUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const updateShortlinkAction = actionUser
  .schema(updateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    const { previous, current } = await updateUseCase.execute({
      ...parsedInput,
      tenantId,
      userRole,
    });

    const prevRedis = toRedisRow(previous);
    const patch = buildRedisPatch(parsedInput);
    if (prevRedis) {
      await onShortlinkUpdated(prevRedis, patch);
    }

    await revalidateTag("shortlinks");

    return { ok: true } as const;
  });

export const deleteShortlinkAction = actionUser
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    const deleted = await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId,
      userRole,
    });

    const redisRow = toRedisRow(deleted);
    if (redisRow) {
      await onShortlinkDeleted(redisRow);
    }

    await revalidateTag("shortlinks");

    return { ok: true } as const;
  });

function extractTenantId(session: any): string | null {
  return (
    session?.session?.activeOrganizationId ??
    session?.user?.activeOrganizationId ??
    session?.user?.tenantId ??
    null
  );
}

type ShortlinkRedisPatch = Partial<import("../../redis.actions").ShortlinkRow>;

function buildRedisPatch(patch: z.output<typeof updateSchema>): ShortlinkRedisPatch {
  const result: ShortlinkRedisPatch = {};
  if (Object.prototype.hasOwnProperty.call(patch, "code") && patch.code !== undefined) {
    result.code = patch.code;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "target") && patch.target !== undefined) {
    result.target = patch.target;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "channel") && patch.channel !== undefined) {
    result.channel = patch.channel ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "active") && patch.active !== undefined) {
    result.active = patch.active;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "expiresAt") && patch.expiresAt !== undefined) {
    result.expiresAt = patch.expiresAt
      ? new Date(patch.expiresAt).toISOString()
      : null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "utm") && patch.utm !== undefined) {
    result.utm = patch.utm ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "merchantId") && patch.merchantId !== undefined) {
    result.merchantId = patch.merchantId;
  }
  return result;
}

function toRedisRow(shortlink: import("@/types/domain").Shortlink | null | undefined) {
  if (!shortlink) return null;
  return {
    id: shortlink.id,
    code: shortlink.code,
    target: shortlink.target,
    merchantId: shortlink.merchantId,
    channel: shortlink.channel ?? null,
    active: shortlink.active,
    expiresAt: shortlink.expiresAt ? new Date(shortlink.expiresAt).toISOString() : null,
    utm: shortlink.utm ?? null,
  };
}
