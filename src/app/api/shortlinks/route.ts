import { NextRequest } from "next/server";

import { listShortlinksServer } from "@/features/shortlinks/server/queries";
import { withApiAuth } from "@/server/core/apiGuards";
import { withErrorHandling } from "@/server/core/http/withErrorHandling";

export const dynamic = "force-dynamic";

const handler = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const tenantOverride = url.searchParams.get("tenantId") ?? undefined;

  if (tenantOverride) {
    url.searchParams.delete("tenantId");
  }

  const filters = Object.fromEntries(url.searchParams.entries());
  const payload = await listShortlinksServer(
    tenantOverride ?? filters,
    tenantOverride ? filters : undefined
  );

  return Response.json(payload);
});

export const GET = withApiAuth(async ({ req }) => handler(req));
