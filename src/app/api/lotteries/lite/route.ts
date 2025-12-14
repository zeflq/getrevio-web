import { NextRequest } from "next/server";

import { listLotteryConfigsLiteServer } from "@/features/lotteries/server/interface/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const data = await listLotteryConfigsLiteServer(filters);
  return Response.json(data);
}
