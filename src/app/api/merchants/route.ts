import { listMerchantsServer } from "@/features/merchants/server/queries";
import { withApiSuperAdmin } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiSuperAdmin<{}>(async ({ req }) => {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listMerchantsServer({ filters });
  return Response.json(payload);
});
