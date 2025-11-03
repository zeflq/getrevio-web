"use server";

import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { placeCreateSchema } from "@/features/places/model/placeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaPlaceRepository } from "../../infrastructure/prisma/prismaPlaceRepository";
import { CreatePlaceUseCase } from "../../application/usecases/createPlaceUseCase";

const repository = new PrismaPlaceRepository();
const useCase = new CreatePlaceUseCase(repository);

export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await useCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("places");

    return { ok: true } as const;
  });
