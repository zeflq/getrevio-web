import { NextRequest } from "next/server";

import { listLandingsServer } from "@/features/landings/server/interface/queries";
import { withErrorHandling } from "@/server/core/http/withErrorHandling";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listLandingsServer(filters);
  return Response.json(payload);
});
