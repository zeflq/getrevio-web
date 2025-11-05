import { getShortlinkServer } from "@/features/shortlinks/server/queries";
import { withApiAuth } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiAuth<{ id: string }>(async ({ req, params }) => {
  const tenantOverride = new URL(req.url).searchParams.get("tenantId") ?? undefined;

  const shortlink = await getShortlinkServer(
    tenantOverride ?? params.id,
    tenantOverride ? params.id : undefined
  );
  if (!shortlink) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(shortlink);
});
