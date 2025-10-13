import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return Response.json({ exists: false });
  }

  const existing = await prisma.place.findFirst({
    where: { slug },
    select: { id: true },
  });

  return Response.json({ exists: !!existing });
}
