"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { themeUpdateSchema } from "@/features/themes/model/themeSchema";
import { landingThemes } from "@/features/landings/theme/themes";
import { buildThemeMeta } from "@/features/themes/lib/themeMeta";

import { PrismaThemeRepository } from "../../infrastructure/prisma/prismaThemeRepository";
import { UpdateThemeUseCase } from "../../application/usecases/updateThemeUseCase";
import { DeleteThemeUseCase } from "../../application/usecases/deleteThemeUseCase";

const repository = new PrismaThemeRepository();
const updateUseCase = new UpdateThemeUseCase(repository);
const deleteUseCase = new DeleteThemeUseCase(repository);

const updateSchema = themeUpdateSchema.partial().extend({ id: z.string(), merchantId: z.string() });
const deleteSchema = z.object({ id: z.string(), merchantId: z.string() });
const presetKeys = z.enum(Object.keys(landingThemes) as [string, ...string[]]);
const resetSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  presetKey: presetKeys,
});

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

export const resetThemeAction = withTenantGuard("merchantId")
  .inputSchema(resetSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.user.roles?.[0] ?? null;
    const meta = buildThemeMeta(parsedInput.presetKey);

    await updateUseCase.execute({
      id: parsedInput.id,
      merchantId: parsedInput.merchantId,
      meta,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("themes");

    return { ok: true } as const;
  });
