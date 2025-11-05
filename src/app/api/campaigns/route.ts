import { NextRequest } from "next/server";

import { listCampaignsServer } from "@/features/campaigns/server/queries";
import { withErrorHandling } from "@/server/core/http/withErrorHandling";
import { withApiAuth } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

const handler = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const tenantOverride = url.searchParams.get("tenantId") ?? undefined;

  if (tenantOverride) {
    url.searchParams.delete("tenantId");
  }

  const filters = Object.fromEntries(url.searchParams.entries());
  const payload = await listCampaignsServer(
    tenantOverride ?? filters,
    tenantOverride ? filters : undefined
  );

  return Response.json(payload);
});

export const GET = withApiAuth(async ({ req }) => handler(req));
