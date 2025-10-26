"use server";

import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { themeCreateSchema } from "@/features/themes/model/themeSchema";

import { PrismaThemeRepository } from "../../infrastructure/prisma/prismaThemeRepository";
import { CreateThemeUseCase } from "../../application/usecases/createThemeUseCase";

const repository = new PrismaThemeRepository();
const useCase = new CreateThemeUseCase(repository);

export const createThemeAction = actionUser
  .schema(themeCreateSchema)
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

    await revalidateTag("themes");

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
