"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { campaignUpdateSchema } from "@/features/campaigns/model/campaignSchema";

import { PrismaCampaignRepository } from "../../infrastructure/prisma/prismaCampaignRepository";
import { UpdateCampaignUseCase } from "../../application/usecases/updateCampaignUseCase";
import { DeleteCampaignUseCase } from "../../application/usecases/deleteCampaignUseCase";

const repository = new PrismaCampaignRepository();
const updateUseCase = new UpdateCampaignUseCase(repository);
const deleteUseCase = new DeleteCampaignUseCase(repository);

const updateSchema = campaignUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const updateCampaignAction = actionUser
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

    await revalidateTag("campaigns");

    return { ok: true } as const;
  });

export const deleteCampaignAction = actionUser
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

    await revalidateTag("campaigns");

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
