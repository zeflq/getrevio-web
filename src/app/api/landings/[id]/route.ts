import { getLandingServer } from "@/features/landings/server/interface/queries";
import { withApiAuth } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiAuth<{ id: string }>(async ({ params }) => {
  const { id } = await params;
  const landing = await getLandingServer(id);
  if (!landing) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(landing);
});
