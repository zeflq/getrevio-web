"use server";

import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { placeCreateSchema } from "@/features/places/model/placeSchema";

import { PrismaPlaceRepository } from "../../infrastructure/prisma/prismaPlaceRepository";
import { CreatePlaceUseCase } from "../../application/usecases/createPlaceUseCase";

const repository = new PrismaPlaceRepository();
const useCase = new CreatePlaceUseCase(repository);

export const createPlaceAction = actionUser
  .schema(placeCreateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    await useCase.execute({
      ...parsedInput,
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
