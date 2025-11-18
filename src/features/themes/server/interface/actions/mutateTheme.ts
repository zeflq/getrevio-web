"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { themeUpdateSchema } from "@/features/themes/model/themeSchema";

import { PrismaThemeRepository } from "../../infrastructure/prisma/prismaThemeRepository";
import { UpdateThemeUseCase } from "../../application/usecases/updateThemeUseCase";
import { DeleteThemeUseCase } from "../../application/usecases/deleteThemeUseCase";
import { SetDefaultThemeUseCase } from "../../application/usecases/setDefaultThemeUseCase";

const repository = new PrismaThemeRepository();
const updateUseCase = new UpdateThemeUseCase(repository);
const deleteUseCase = new DeleteThemeUseCase(repository);
const setDefaultUseCase = new SetDefaultThemeUseCase(repository);

const updateSchema = themeUpdateSchema.partial().extend({ id: z.string(), merchantId: z.string() });
const deleteSchema = z.object({ id: z.string(), merchantId: z.string() });
const setDefaultSchema = z.object({ merchantId: z.string(), themeId: z.string() });

export const updateThemeAction = withTenantGuard("merchantId")
  .inputSchema(updateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.user.roles?.[0] ?? null;

    await updateUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("themes");

    return { ok: true } as const;
  });

export const deleteThemeAction = withTenantGuard("merchantId")
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.user.roles?.[0] ?? null;

    await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("themes");

    return { ok: true } as const;
  });

export const setDefaultThemeAction = withTenantGuard("merchantId")
  .inputSchema(setDefaultSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.user.roles?.[0] ?? null;

    await setDefaultUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("themes");

    return { ok: true } as const;
  });
