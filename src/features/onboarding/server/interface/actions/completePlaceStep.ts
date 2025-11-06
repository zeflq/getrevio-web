"use server";

import { randomUUID } from "node:crypto";

import { withTenantGuard } from "@/lib/actionUser";
import { auth } from "@/lib/auth";
import { ActionError } from "@/lib/action-error";
import { SUPER_ADMIN } from "@/lib/utils";
import { CreatePlaceUseCase } from "@/features/places/server/application/usecases/createPlaceUseCase";
import { UpdatePlaceUseCase } from "@/features/places/server/application/usecases/updatePlaceUseCase";
import { PrismaPlaceRepository } from "@/features/places/server/infrastructure/prisma/prismaPlaceRepository";
import { PrismaPlaceQueryRepository } from "@/features/places/server/infrastructure/prisma/prismaPlaceQueryRepository";
import { GetPlaceUseCase } from "@/features/places/server/application/usecases/getPlaceUseCase";
import { CreateShortlinkUseCase } from "@/features/shortlinks/server/application/usecases/createShortlinkUseCase";
import { PrismaShortlinkRepository } from "@/features/shortlinks/server/infrastructure/prisma/prismaShortlinkRepository";
import { onShortlinkCreated } from "@/features/shortlinks/server/redis.actions";

import { placeStepSubmitSchema, type PlaceStepData } from "../../../model/placeStepSchema";
import type { OrganizationStepData } from "../../../model/organizationStepSchema";

type ShortlinkSummary = {
  id: string;
  code: string;
  targetPlaceId: string;
};

const repository = new PrismaPlaceRepository();
const createUseCase = new CreatePlaceUseCase(repository);
const updateUseCase = new UpdatePlaceUseCase(repository);

const queryRepository = new PrismaPlaceQueryRepository();
const getPlaceUseCase = new GetPlaceUseCase(queryRepository);

const shortlinkRepository = new PrismaShortlinkRepository();
const createShortlinkUseCase = new CreateShortlinkUseCase(shortlinkRepository);

export const completePlaceStepAction = withTenantGuard("organizationId")
  .inputSchema(placeStepSubmitSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;
    const organizationId = parsedInput.organizationId;

    if (!organizationId) {
      throw new ActionError(400, "ORGANIZATION_REQUIRED");
    }
    const headers = ctx.headers;

    const normalized = normalizePlaceInput(parsedInput);
    let placeId = parsedInput.placeId;

    const isNewPlace = !placeId;
    let createdShortlink: ShortlinkSummary | null = null;

    if (placeId) {
      try {
        await updateUseCase.execute({
          id: placeId,
          tenantId: organizationId,
          userRole,
          merchantId: organizationId,
          localName: normalized.localName,
          address: normalized.address,
          googlePlaceId: normalized.googlePlaceId,
        });
      } catch (error) {
        handlePlaceError(error);
      }
    } else {
      const slug = generateRandomSlug();

      try {
        placeId = await createUseCase.execute({
          merchantId: organizationId,
          tenantId: organizationId,
          userRole,
          localName: normalized.localName,
          slug,
          address: normalized.address,
          googlePlaceId: normalized.googlePlaceId,
        });
      } catch (error) {
        handlePlaceError(error);
      }
    }

    if (!placeId) {
      throw new ActionError(500, "PLACE_NOT_CREATED");
    }

    const place = await getPlaceUseCase.execute({
      id: placeId,
      tenantId: organizationId,
    });

    if (!place) {
      throw new ActionError(404, "PLACE_NOT_FOUND");
    }

    if (isNewPlace) {
      createdShortlink = await createDefaultPlaceShortlink({
        organizationId,
        placeId,
        userRole,
      });
    }

    const updatedOrganization = await auth.api.updateOrganization({
      headers,
      body: {
        organizationId,
        data: {
          onboardingStep: 3,
        },
      },
    });

    const organization: OrganizationStepData = {
      id: updatedOrganization?.id ?? organizationId,
      name: updatedOrganization?.name ?? "",
      email: updatedOrganization?.email ?? undefined,
      onboardingStep:
        typeof updatedOrganization?.onboardingStep === "number"
          ? updatedOrganization.onboardingStep
          : 3,
    };

    const placeData = mapPlaceToStepData(place);

    return {
      ok: true as const,
      organization,
      place: placeData,
      shortlink: createdShortlink,
    };
  });

function normalizePlaceInput(
  input: {
    localName: string;
    address?: string | null;
    googlePlaceId?: string | null;
  }
) {
  const trimOrUndefined = (value?: string | null) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const next = value.trim();
    return next.length > 0 ? next : undefined;
  };

  return {
    localName: input.localName.trim(),
    address: trimOrUndefined(input.address),
    googlePlaceId: trimOrUndefined(input.googlePlaceId),
  };
}

function mapPlaceToStepData(place: {
  id: string;
  merchantId: string;
  localName: string;
  slug: string;
  address?: string | null;
  googlePlaceId?: string | null;
}): PlaceStepData {
  return {
    id: place.id,
    localName: place.localName,
    address: place.address ?? undefined,
    googlePlaceId: place.googlePlaceId ?? undefined,
  };
}

function generateRandomSlug(): string {
  return randomUUID().replace(/-/g, "").slice(0, 10);
}

async function createDefaultPlaceShortlink(args: {
  organizationId: string;
  placeId: string;
  userRole?: string | null;
}): Promise<ShortlinkSummary | null> {
  try {
    const shortlink = await createShortlinkUseCase.execute({
      merchantId: args.organizationId,
      tenantId: args.organizationId,
      userRole: args.userRole ?? null,
      target: { t: "place", pid: args.placeId },
      active: true,
    });

    const redisRow = toRedisRow(shortlink);
    if (redisRow) {
      await onShortlinkCreated(redisRow);
    }

    return shortlink
      ? {
          id: shortlink.id,
          code: shortlink.code,
          targetPlaceId: args.placeId,
        }
      : null;
  } catch (error) {
    if (error instanceof ActionError) {
      throw error;
    }

    throw new ActionError(500, error instanceof Error ? error.message : "SHORTLINK_CREATE_FAILED");
  }
}

function toRedisRow(shortlink: import("@/types/domain").Shortlink | null | undefined) {
  if (!shortlink) return null;
  return {
    id: shortlink.id,
    code: shortlink.code,
    target: shortlink.target,
    merchantId: shortlink.merchantId,
    channel: shortlink.channel ?? null,
    themeId: shortlink.themeId ?? null,
    active: shortlink.active,
    expiresAt: shortlink.expiresAt ? new Date(shortlink.expiresAt).toISOString() : null,
    utm: shortlink.utm ?? null,
  };
}


function handlePlaceError(error: unknown): never {
  if (error instanceof ActionError) {
    throw error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("unique") && message.includes("slug")) {
      throw new ActionError(409, "SLUG_TAKEN");
    }

    throw new ActionError(500, error.message || "UNKNOWN_ERROR");
  }

  throw new ActionError(500, "UNKNOWN_ERROR");
}
