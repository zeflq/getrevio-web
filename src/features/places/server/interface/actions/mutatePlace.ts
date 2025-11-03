"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withAuth, withTenantGuard } from "@/lib/actionUser";
import { placeUpdateSchema } from "@/features/places/model/placeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaPlaceRepository } from "../../infrastructure/prisma/prismaPlaceRepository";
import { UpdatePlaceUseCase } from "../../application/usecases/updatePlaceUseCase";
import { DeletePlaceUseCase } from "../../application/usecases/deletePlaceUseCase";

const repository = new PrismaPlaceRepository();
const updateUseCase = new UpdatePlaceUseCase(repository);
const deleteUseCase = new DeletePlaceUseCase(repository);

const updateSchema = placeUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const updatePlaceAction = withTenantGuard("merchantId")
  .inputSchema(updateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await updateUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("places");

    return { ok: true } as const;
  });

export const deletePlaceAction = withAuth
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("places");

    return { ok: true } as const;
  });
