import { getShortlinkServer } from "@/features/shortlinks/server/queries";
import { withApiSuperAdmin } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiSuperAdmin<{ id: string }>(async ({ params }) => {
  const shortlink = await getShortlinkServer(params.id);
  if (!shortlink) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(shortlink);
});
