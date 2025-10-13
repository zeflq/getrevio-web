import { NextRequest } from "next/server";

import { listShortlinksServer } from "@/features/shortlinks/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listShortlinksServer(filters);
  return Response.json(payload);
}
