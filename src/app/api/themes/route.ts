import { NextRequest } from "next/server";

import { listThemesServer } from "@/features/themes/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listThemesServer(filters);
  return Response.json(payload);
}
