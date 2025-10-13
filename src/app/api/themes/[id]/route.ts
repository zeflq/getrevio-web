import { NextRequest } from "next/server";

import { getThemeServer } from "@/features/themes/server/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const theme = await getThemeServer(params.id);
  if (!theme) {
    return new Response("Not Found", { status: 404 });
  }
  return Response.json(theme);
}
