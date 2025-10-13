import { NextRequest } from "next/server";

import { getPlaceServer } from "@/features/places/server/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const place = await getPlaceServer(params.id);
  if (!place) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(place);
}
