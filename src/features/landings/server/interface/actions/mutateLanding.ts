"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withAuth, withTenantGuard } from "@/lib/actionUser";
import { landingUpdateSchema } from "@/features/landings/model/landingSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaLandingRepository } from "../../infrastructure/prisma/prismaLandingRepository";
import { UpdateLandingUseCase } from "../../application/usecases/updateLandingUseCase";
import { DeleteLandingUseCase } from "../../application/usecases/deleteLandingUseCase";
import { PrismaLandingAssociationGateway } from "../../infrastructure/prisma/prismaLandingAssociationGateway";

const repository = new PrismaLandingRepository();
const associations = new PrismaLandingAssociationGateway();
const updateUseCase = new UpdateLandingUseCase(repository, associations);
const deleteUseCase = new DeleteLandingUseCase(repository);

const updateSchema = landingUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const updateLandingAction = withTenantGuard("merchantId")
  .inputSchema(updateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    // On sépare ce qui est sensible
    const { slug, templateId, merchantId, ...rest } = parsedInput;

    // Si super admin → il peut tout modifier
    const safeInput = ctx.isSuperAdmin
      ? parsedInput
      : {
          ...rest,
          // on force le merchantId côté serveur
          merchantId: ctx.tenantId ?? merchantId,
          // on ignore slug et templateId (ils ne seront jamais passés au use case)
          slug: undefined,
          templateId: undefined,
        };

    await updateUseCase.execute({
      ...safeInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });


export const deleteLandingAction = withAuth
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });
