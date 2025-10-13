import { NextRequest } from "next/server";

import { listCampaignsLiteServer } from "@/features/campaigns/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const data = await listCampaignsLiteServer(filters);
  return Response.json(data);
}
