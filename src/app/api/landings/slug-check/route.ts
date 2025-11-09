import { NextRequest } from "next/server";

import { checkLandingSlugServer } from "@/features/landings/server/interface/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const tenantOverride = url.searchParams.get("tenantId");
  const resolvedTenantId = tenantOverride ?? null;

  if (!slug) {
    return Response.json({ exists: false });
  }

  const exists = await checkLandingSlugServer({
    slug,
    tenantId: resolvedTenantId,
  });

  return Response.json({ exists });
}
