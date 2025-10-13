import { NextRequest } from "next/server";

import { getCampaignServer } from "@/features/campaigns/server/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const campaign = await getCampaignServer(params.id);
  if (!campaign) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(campaign);
}
