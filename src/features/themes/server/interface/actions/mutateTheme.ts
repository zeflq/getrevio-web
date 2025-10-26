"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { themeUpdateSchema } from "@/features/themes/model/themeSchema";

import { PrismaThemeRepository } from "../../infrastructure/prisma/prismaThemeRepository";
import { UpdateThemeUseCase } from "../../application/usecases/updateThemeUseCase";
import { DeleteThemeUseCase } from "../../application/usecases/deleteThemeUseCase";
import { SetDefaultThemeUseCase } from "../../application/usecases/setDefaultThemeUseCase";

const repository = new PrismaThemeRepository();
const updateUseCase = new UpdateThemeUseCase(repository);
const deleteUseCase = new DeleteThemeUseCase(repository);
const setDefaultUseCase = new SetDefaultThemeUseCase(repository);

const updateSchema = themeUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });
const setDefaultSchema = z.object({ merchantId: z.string(), themeId: z.string() });

export const updateThemeAction = actionUser
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

    await revalidateTag("themes");

    return { ok: true } as const;
  });

export const deleteThemeAction = actionUser
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

    await revalidateTag("themes");

    return { ok: true } as const;
  });

export const setDefaultThemeAction = actionUser
  .schema(setDefaultSchema)
  .action(async ({ parsedInput }) => {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("FORBIDDEN");
    }

    const tenantId = extractTenantId(session);
    const userRole = session.user?.globalRole ?? null;

    await setDefaultUseCase.execute({
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
