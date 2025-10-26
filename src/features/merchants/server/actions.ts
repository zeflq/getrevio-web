"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import {
  merchantCreateSchema,
  merchantUpdateSchema,
} from "@/features/merchants/model/merchantSchema";

import { PrismaMerchantRepository } from "./infrastructure/prisma/prismaMerchantRepository";
import { CreateMerchantUseCase } from "./application/usecases/createMerchantUseCase";
import { UpdateMerchantUseCase } from "./application/usecases/updateMerchantUseCase";
import { DeleteMerchantUseCase } from "./application/usecases/deleteMerchantUseCase";

const repository = new PrismaMerchantRepository();
const createUseCase = new CreateMerchantUseCase(repository);
const updateUseCase = new UpdateMerchantUseCase(repository);
const deleteUseCase = new DeleteMerchantUseCase(repository);

const updateSchema = merchantUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const createMerchantAction = actionUser
  .schema(merchantCreateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    const result = await createUseCase.execute({
      ...parsedInput,
      tenantId,
      userRole,
    });

    await revalidateTag("merchants");

    return result;
  });

export const updateMerchantAction = actionUser
  .schema(updateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    const result = await updateUseCase.execute({
      ...parsedInput,
      tenantId,
      userRole,
    });

    await revalidateTag("merchants");

    return result;
  });

export const deleteMerchantAction = actionUser
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

    if (!deleted) {
      throw new Error("NOT_FOUND");
    }

    await revalidateTag("merchants");

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
