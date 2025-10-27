"use server";

import { randomUUID } from "node:crypto";
import { headers as nextHeaders } from "next/headers";

import { actionUser } from "@/lib/actionUser";
import { auth } from "@/lib/auth";

import {
  organizationStepSubmitSchema,
  type OrganizationStepData,
} from "../../../model/organizationStepSchema";
import { ActionError } from "@/lib/action-error";

const MAX_SLUG_ATTEMPTS = 15;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function isSlugAvailable(slug: string, headers: HeadersInit): Promise<boolean> {
  try {
    const response = await auth.api.checkOrganizationSlug({ headers, body: { slug } });
    return response?.status === true;
  } catch (error) {
    if (error instanceof Error && /slug is taken/i.test(error.message)) {
      return false;
    }
    throw error;
  }
}

async function resolveSlug(name: string, headers: HeadersInit): Promise<string> {
  const base = slugify(name) || `org-${randomUUID().slice(0, 6)}`;

  if (await isSlugAvailable(base, headers)) {
    return base;
  }

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = `${base}-${attempt}`;
    if (await isSlugAvailable(candidate, headers)) {
      return candidate;
    }
  }

  throw new Error("Unable to find an available slug. Please try a different name.");
}

export const completeOrganizationStepAction = actionUser
  .inputSchema(organizationStepSubmitSchema)
  .action(async ({ parsedInput }) => {
    const headers = await nextHeaders();
    const email = parsedInput.email;

    if (parsedInput.organizationId) {
      const organization = await updateOrganizationRecord({
        headers,
        organizationId: parsedInput.organizationId,
        name: parsedInput.name,
        email,
      });

      return {
        ok: true as const,
        organization,
      };
    }

    const organization = await createOrganizationRecord({
      headers,
      name: parsedInput.name,
      email
    });

    return {
      ok: true as const,
      organization,
    };
  });

async function createOrganizationRecord(args: {
  headers: HeadersInit;
  name: string;
  email?: string;
}): Promise<OrganizationStepData> {
  const { headers, name, email } = args;
  const slug = await resolveSlug(name, headers);

  try {
    const created = await auth.api.createOrganization({
      headers,
      body: {
        name,
        slug,
        email: email,
        onboardingStep: 1,
        keepCurrentActiveOrganization: false,
      },
    });

    return {
      id: created?.id,
      name: created?.name ?? name,
      email: email ?? undefined,
    };
  } catch (error) {
    handleOrganizationError(error);
  }
}

async function updateOrganizationRecord(args: {
  headers: HeadersInit;
  organizationId: string;
  name: string;
  email?: string;
}): Promise<OrganizationStepData> {
  const { headers, organizationId, name, email } = args;

  try {
    const updated = await auth.api.updateOrganization({
      headers,
      body: {
        organizationId,
        data: {
          name,
          email: email,
        },
      },
    });

    return {
      id: updated?.id ?? organizationId,
      name: updated?.name ?? name,
      email: email ?? undefined,
      onboardingStep: 1,
    };
  } catch (error) {
    handleOrganizationError(error);
  }
}

function handleOrganizationError(error: unknown): never {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("email") && (message.includes("unique") || message.includes("exists"))) {
      throw new ActionError(409, "EMAIL_ALREADY_USED");
    }

    if (message.includes("slug") && message.includes("taken")) {
      throw new ActionError(409, "SLUG_TAKEN");
    }

    throw new ActionError(500, error.message || "UNKNOWN_ERROR");
  }

  throw new ActionError(500, "UNKNOWN_ERROR");
}