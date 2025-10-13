import { NextRequest } from "next/server";

import { listThemesLiteServer } from "@/features/themes/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const data = await listThemesLiteServer(filters);
  return Response.json(data);
}
