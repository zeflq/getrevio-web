import { getCampaignServer } from "@/features/campaigns/server/queries";
import { withApiAuth } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiAuth<{ id: string }>(async ({ req, params }) => {
  const { id } = await params;
  const tenantOverride = new URL(req.url).searchParams.get("tenantId") ?? undefined;

  const campaign = await getCampaignServer(
    tenantOverride ?? id,
    tenantOverride ? id : undefined
  );

  if (!campaign) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(campaign);
});
