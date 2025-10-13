import { NextRequest } from "next/server";
import { listMerchantsLiteServer } from "@/features/merchants/server/queries";
// import { getSession } from "@/lib/auth"; // uncomment if you enforce auth

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // const s = await getSession();
  // if (!s?.user) return new Response("Unauthorized", { status: 401 });

    const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
    // If multi-tenant later: pass { filters, tenantId: s.tenantId }
    const data = await listMerchantsLiteServer({ filters });
  return Response.json(data); // -> [{ value, label }]
}
