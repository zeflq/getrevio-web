import { NextRequest } from "next/server";

import { getServerSession } from "@/lib/auth-server";
import { CheckPlaceSlugUseCase } from "@/features/places/server/application/usecases/checkPlaceSlugUseCase";
import { PrismaPlaceQueryRepository } from "@/features/places/server/infrastructure/prisma/prismaPlaceQueryRepository";

export const dynamic = "force-dynamic";

const repository = new PrismaPlaceQueryRepository();
const checkSlugUseCase = new CheckPlaceSlugUseCase(repository);

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return Response.json({ exists: false });
  }

  const session = await getServerSession();
  const tenantId = extractTenantId(session);

  const exists = await checkSlugUseCase.execute({
    slug,
    tenantId,
  });

  return Response.json({ exists });
}

function extractTenantId(session: any): string | null {
  return (
    session?.session?.activeOrganizationId ??
    session?.user?.activeOrganizationId ??
    session?.user?.tenantId ??
    null
  );
}
