// features/merchants/routes/app/api/merchants/route.ts
import { NextRequest } from "next/server";
import { listMerchantsServer } from "@/features/merchants/server/queries";
//import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    // const session = await getSession();
    // if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const filters = Object.fromEntries(new URL(req.url).searchParams.entries());
    const payload = await listMerchantsServer({ filters });
    return Response.json(payload);
}

export const dynamic = "force-dynamic";      // optional config to re-export
