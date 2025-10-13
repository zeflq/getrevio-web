// features/merchants/routes/app/api/merchants/[id]/route.ts
import { getMerchantServer } from "@/features/merchants/server/queries";
import { NextRequest } from "next/server";
//import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//  const s = await getSession();
  //if (!s?.user) return new Response("Unauthorized", { status: 401 });
    const item = await getMerchantServer(params.id);
    if (!item) return new Response("Not Found", { status: 404 });
    return Response.json(item);
}

export const dynamic = "force-dynamic";
