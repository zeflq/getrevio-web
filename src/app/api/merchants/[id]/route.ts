import { getMerchantServer } from "@/features/merchants/server/queries";
import { withApiSuperAdmin } from "@/server/core/apiGuards";

export const GET = withApiSuperAdmin<{ id: string }>(async ({ params }) => {
  const { id } = await params;

  const merchant = await getMerchantServer({id});

  if (!merchant) {
    return new Response("Not Found", { status: 404 });
  }

  return Response.json(merchant);
});

export const dynamic = "force-dynamic";
