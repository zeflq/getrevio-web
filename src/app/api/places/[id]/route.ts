import { getPlaceServer } from "@/features/places/server/interface/queries";
import { withApiAuth } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiAuth<{ id: string }>(async ({ params }) => {
  const place = await getPlaceServer(params.id);
  if (!place) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(place);
});
