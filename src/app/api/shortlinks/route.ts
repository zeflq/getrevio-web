import { listShortlinksServer } from "@/features/shortlinks/server/queries";
import { withApiSuperAdmin } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiSuperAdmin<{}>(async ({ req }) => {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listShortlinksServer(filters);
  return Response.json(payload);
});
