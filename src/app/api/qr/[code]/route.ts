import QRCode from "qrcode";
import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { withApiAuth } from "@/server/core/apiGuards";
import { assertTenantAccess } from "@/server/core/guards/authGuards";

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL;
const SHORT_BASE = (process.env.NEXT_PUBLIC_SHORT_URL_BASE ?? "").replace(/\/$/, "");

export const dynamic = "force-dynamic";

export const GET = withApiAuth<{ code: string }>(async ({ req, params, auth }) => {
  const shortlink = await prisma.shortlink.findUnique({
    where: { code: params.code },
    select: { merchantId: true },
  });

  if (!shortlink) {
    return new Response("Not Found", { status: 404 });
  }

  assertTenantAccess(auth, shortlink.merchantId);

  const origin = APP_BASE ?? new URL(req.url).origin;
  const base = SHORT_BASE || origin;
  const targetUrl = `${base}/${encodeURIComponent((await params).code)}`;

  const png = await QRCode.toBuffer(targetUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
  });

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=60",
    },
  });
});
