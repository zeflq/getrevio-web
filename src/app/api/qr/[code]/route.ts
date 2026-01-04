import { NextRequest } from "next/server";
import { proxyToAPI } from "@/lib/serverProxy";
import endpoints from "@/shared/api/endpoints.json";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const endpoint = endpoints.shortlinks.qr.replace(":code", encodeURIComponent(code));
  try {
    const response = await proxyToAPI({
      endpoint,
      request: req,
      responseType: "binary",
    });

    return response;
  } catch (error) {
    console.error("Error fetching QR code from API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
