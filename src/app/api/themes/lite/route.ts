import { NextRequest } from "next/server";

import { listThemesLiteServer } from "@/features/themes/server/queries";
import { withErrorHandling } from "@/server/core/http/withErrorHandling";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const filters = Object.fromEntries(url.searchParams.entries());

  const data = await listThemesLiteServer(filters);
  return Response.json(data);
});