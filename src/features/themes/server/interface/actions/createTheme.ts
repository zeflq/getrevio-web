"use server";

import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { themeCreateSchema } from "@/features/themes/model/themeSchema";

import { PrismaThemeRepository } from "../../infrastructure/prisma/prismaThemeRepository";
import { CreateThemeUseCase } from "../../application/usecases/createThemeUseCase";

const repository = new PrismaThemeRepository();
const useCase = new CreateThemeUseCase(repository);

export const createThemeAction = withTenantGuard("merchantId")
  .inputSchema(themeCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.user.roles?.[0] ?? null;

    await useCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("themes");

    return { ok: true } as const;
  });
