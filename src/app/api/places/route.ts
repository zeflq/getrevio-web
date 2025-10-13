import { NextRequest } from "next/server";

import { listPlacesServer } from "@/features/places/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
  const payload = await listPlacesServer(filters);
  return Response.json(payload);
}
