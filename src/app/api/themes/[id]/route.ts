import { NextRequest } from "next/server";

import { getThemeServer } from "@/features/themes/server/queries";
import { withErrorHandling } from "@/server/core/http/withErrorHandling";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const tenantOverride = new URL(req.url).searchParams.get("tenantId") ?? undefined;

  const theme = await getThemeServer(
    tenantOverride ?? params.id,
    tenantOverride ? params.id : undefined
  );

  if (!theme) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(theme);
});
