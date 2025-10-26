"use server";

import { revalidateTag } from "next/cache";

import { actionUser } from "@/lib/actionUser";
import { getServerSession } from "@/lib/auth-server";
import { campaignCreateSchema } from "@/features/campaigns/model/campaignSchema";

import { PrismaCampaignRepository } from "../../infrastructure/prisma/prismaCampaignRepository";
import { CreateCampaignUseCase } from "../../application/usecases/createCampaignUseCase";

const repository = new PrismaCampaignRepository();
const useCase = new CreateCampaignUseCase(repository);

export const createCampaignAction = actionUser
  .schema(campaignCreateSchema)
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
