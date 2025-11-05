import { listMerchantsLiteServer } from "@/features/merchants/server/queries";
import { withApiSuperAdmin } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiSuperAdmin<{}>(async ({ req }) => {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const data = await listMerchantsLiteServer({ filters });
  return Response.json(data);
});
