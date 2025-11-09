"use server";

import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { shortlinkCreateSchema } from "@/features/shortlinks/model/shortlinkSchema";

import { PrismaShortlinkRepository } from "../../infrastructure/prisma/prismaShortlinkRepository";
import { CreateShortlinkUseCase } from "../../application/usecases/createShortlinkUseCase";
import { onShortlinkCreated } from "../../redis.actions";

const repository = new PrismaShortlinkRepository();
const useCase = new CreateShortlinkUseCase(repository);

export const createShortlinkAction = actionUser
  .schema(shortlinkCreateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    const created = await useCase.execute({
      ...parsedInput,
      tenantId,
      userRole,
    });

    const redisRow = toRedisRow(created);
    if (redisRow) {
      await onShortlinkCreated(redisRow);
    }

    await revalidateTag("shortlinks");

    return { ok: true, id: created.id } as const;
  });

function extractTenantId(session: any): string | null {
  return (
    session?.session?.activeOrganizationId ??
    session?.user?.activeOrganizationId ??
    session?.user?.tenantId ??
    null
  );
}

function toRedisRow(shortlink: import("@/types/domain").Shortlink | null | undefined) {
  if (!shortlink) return null;
  return {
    id: shortlink.id,
    code: shortlink.code,
    landingId: shortlink.landingId ?? null,
    campaignId: shortlink.campaignId ?? null,
    placeId: shortlink.placeId ?? null,
    merchantId: shortlink.merchantId,
    channel: shortlink.channel ?? null,
    active: shortlink.active,
    expiresAt: shortlink.expiresAt ? new Date(shortlink.expiresAt).toISOString() : null,
    utm: shortlink.utm ?? null,
  };
}
