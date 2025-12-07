import { getLotteryConfigServer } from "@/features/lotteries/server/interface/queries";
import { withApiAuth } from "@/server/core/apiGuards";

export const dynamic = "force-dynamic";

export const GET = withApiAuth<{ id: string }>(async ({ params }) => {
  const { id } = await params;
  const config = await getLotteryConfigServer(id);
  if (!config) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(config);
});
