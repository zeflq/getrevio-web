import { NextRequest } from "next/server";

import { listCampaignsServer } from "@/features/campaigns/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listCampaignsServer(filters);
  return Response.json(payload);
}
