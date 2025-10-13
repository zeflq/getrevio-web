import { NextRequest } from "next/server";

import { getShortlinkServer } from "@/features/shortlinks/server/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const shortlink = await getShortlinkServer(params.id);
  if (!shortlink) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(shortlink);
}
