"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { placeUpdateSchema } from "@/features/places/model/placeSchema";

import { PrismaPlaceRepository } from "../../infrastructure/prisma/prismaPlaceRepository";
import { UpdatePlaceUseCase } from "../../application/usecases/updatePlaceUseCase";
import { DeletePlaceUseCase } from "../../application/usecases/deletePlaceUseCase";

const repository = new PrismaPlaceRepository();
const updateUseCase = new UpdatePlaceUseCase(repository);
const deleteUseCase = new DeletePlaceUseCase(repository);

const updateSchema = placeUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const updatePlaceAction = actionUser
  .schema(updateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    await updateUseCase.execute({
      ...parsedInput,
      tenantId,
      userRole,
    });

    await revalidateTag("places");

    return { ok: true } as const;
  });

export const deletePlaceAction = actionUser
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId,
      userRole,
    });

    await revalidateTag("places");

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
