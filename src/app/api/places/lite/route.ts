import { NextRequest } from "next/server";

import { listPlacesLiteServer } from "@/features/places/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const data = await listPlacesLiteServer(filters);
  return Response.json(data);
}
