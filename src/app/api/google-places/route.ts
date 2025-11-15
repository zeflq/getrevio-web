import { withApiAuth } from "@/server/core/apiGuards";
import { auth as betterAuth } from "@/lib/auth";
import { headers as serverHeaders } from "next/headers";
import type { ListEnvelope } from "@/hooks/createCrudBridge";
import { ListPlacesLiteUseCase } from "@/features/places/server/application/usecases/listPlacesLiteUseCase";
import { PrismaPlaceQueryRepository } from "@/features/places/server/infrastructure/prisma/prismaPlaceQueryRepository";
import { placeQueryPolicy } from "@/features/places/server/policy";
import type { PlaceFilters } from "@/features/places/model/placeSchema";
import {
  mapGoogleLocationToRow,
  type GooglePlaceRow,
  type GooglePlacesApiResponse,
} from "@/features/google-places/types";

const placeRepository = new PrismaPlaceQueryRepository();
const listPlacesLiteUseCase = new ListPlacesLiteUseCase(placeRepository);

export const dynamic = "force-dynamic";

export const GET = withApiAuth(async ({ req, auth }) => {
  try {
    const linkedPlaceIdsPromise = collectLinkedPlaceIds(auth.tenantId);

    const { accessToken } = await betterAuth.api.getAccessToken({
      body: { providerId: "google" },
      headers: await serverHeaders(),
    });

    if (!accessToken) {
      return new Response("Google OAuth required", { status: 401 });
    }
console.log("Google Access Token:", accessToken);
    // Step 1: Get accountId from Google
    const accountListRes = await fetch("https://mybusinessbusinessinformation.googleapis.com/v1/accounts", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: "application/json",
      },
    });
    console.log("Google Accounts response status:", accountListRes);

    if (!accountListRes.ok) {
      const err = await accountListRes.json().catch(() => null);
      const status = err?.error?.code ?? 500;
      const message = err?.error?.message ?? "Unable to retrieve Google account";
      console.error("Failed to fetch Google account:", err);
      return new Response(message, { status });
    }

    const accountData = await accountListRes.json();
    const accountId = accountData?.accounts?.[0]?.name; // e.g. "accounts/123456"

    if (!accountId) {
      return new Response("No linked Google Business account found", { status: 404 });
    }
    // Step 2: Build query
    const url = new URL(req.url);
    const searchParams = new URLSearchParams();

    const requestedLimit = Math.max(
      1,
      Number(url.searchParams.get("_limit") ?? url.searchParams.get("pageSize") ?? 10)
    );

    const allowedParams = ["readMask", "pageSize", "pageToken", "filter"];
    allowedParams.forEach((param) => {
      const value = url.searchParams.get(param);
      if (value) searchParams.append(param, value);
    });

    if (!searchParams.has("pageSize")) {
      searchParams.set("pageSize", String(requestedLimit));
    }

    if (!searchParams.has("readMask")) {
      searchParams.set("readMask", "name,title,locationName,primaryPhone,websiteUri,storeCode,regularHours");
    }

    const googleApiUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations${
      searchParams.size ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(googleApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Google My Business API error:", errorData);
      return new Response(`Google API error: ${response.status} ${response.statusText}`, {
        status: response.status,
      });
    }

    const raw = (await response.json()) as GooglePlacesApiResponse;
    const rows = raw.locations ?? [];
    const total = raw.totalSize ?? rows.length;
    const totalPages = Math.max(1, Math.ceil(total / requestedLimit));
    const linkedPlaceIds = await linkedPlaceIdsPromise;

    const envelope: ListEnvelope<GooglePlaceRow> = {
      data: rows.map((location) => mapGoogleLocationToRow(location, linkedPlaceIds)),
      total,
      totalPages,
    };

    return Response.json(envelope);
  } catch (error) {
    console.error("Google Places fetch failed:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

async function collectLinkedPlaceIds(tenantId?: string | null) {
  if (!tenantId) return new Set<string>();
  const pageSize = placeQueryPolicy.maxPageSize;
  const filters: PlaceFilters = {
    q: undefined,
    localName: undefined,
    merchantId: tenantId,
    page: 1,
    pageSize,
    sort: "createdAt",
    order: "asc",
  };

  const result = await listPlacesLiteUseCase.execute({
    filters,
    tenantId,
  });

  return new Set(
    result
      .filter((place) => place.googlePlaceId)
      .map((place) => place.googlePlaceId!) // filter ensures defined
  );
}
