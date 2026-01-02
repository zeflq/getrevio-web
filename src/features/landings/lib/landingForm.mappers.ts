import {
  type LandingBelongsTo,
  type LandingBelongsToExternal,
  type LandingFormValues,
  type LandingUpdateInput,
} from "../model/landingSchema";
import {
  createLandingContentDefaults,
  ensureLandingContentShape,
  type LandingContentInput,
} from "../model/landingContentSchema";
import { createBlockByKind } from "../blocks";
import { getTemplateByIdForLocale } from "../templates";
import type { Landing } from "@/types/domain";

type LandingFormShape = LandingFormValues;

type BuildLandingPayloadOptions = {
  seedTemplateContent?: boolean;
};

const buildTemplateContent = (
  templateId?: string | null,
  locale: string = "en"
): LandingContentInput | null => {
  // Get template with actual translations for the locale
  const template = getTemplateByIdForLocale(templateId, locale);
  if (!template) return null;

  // Only pick fixed blocks
  const blocks = template.blocks
    .filter((definition) => definition.mode === "fixed")
    .map((definition) => {
      // definition.label, definition.description, and addon defaultData already contain actual translations
      const block = createBlockByKind(
        definition.kind,
        definition.defaultData as any,
        definition.addons?.filter((addonDef) => addonDef.mode === "fixed"),
        definition.label, // Already translated text for locale
        definition.description // Already translated text for locale
      );
      block.__templateBlockId = definition.id;
      block.__templateFixed = true;
      return block;
    });

  return {
    layout: "full",
    blocks,
  };
};


const toInternalBelongsTo = (
  src?: LandingBelongsTo | LandingBelongsToExternal | null
): LandingBelongsTo & { googlePlaceId?: string | null } => {
  if (!src) return { type: "place", placeId: "" };

  // Preserve googlePlaceId if present (from external format)
  const googlePlaceId = "googlePlaceId" in src ? src.googlePlaceId : undefined;

  if ("placeId" in src || "campaignId" in src) {
    return src.type === "campaign"
      ? { type: "campaign", campaignId: src.campaignId ?? "", googlePlaceId }
      : { type: "place", placeId: src.placeId ?? "", googlePlaceId };
  }

  return src.type === "campaign"
    ? { type: "campaign", campaignId: src.id ?? "", googlePlaceId }
    : { type: "place", placeId: src.id ?? "", googlePlaceId };
};

export const ensureBelongsToForForm = (
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal | null
): LandingBelongsTo & { googlePlaceId?: string | null } => toInternalBelongsTo(belongsTo);

export const createLandingFormDefaults = (args?: {
  merchantId?: string;
  belongsTo?: any;
}): LandingFormValues => ({
  settings: {
    merchantId: args?.merchantId ?? "",
    name: "",
    status: "draft",
  },
  belongsTo: ensureBelongsToForForm(args?.belongsTo),
  content: createLandingContentDefaults(),
  templateId: "",
  themeId: undefined,
});

export const fillLandingFormFromEntity = (landing?: Landing | null): LandingFormValues => {
  if (!landing) {
    return createLandingFormDefaults();
  }

  const belongsToSource =
    landing.belongsTo ??
    (landing.placeId
      ? { type: "place", placeId: landing.placeId }
      : landing.campaignId
        ? { type: "campaign", campaignId: landing.campaignId }
        : undefined);

  return {
    settings: {
      merchantId: landing.merchantId ?? "",
      name: landing.name ?? "",
      status: landing.status ?? "draft",
    },
    belongsTo: ensureBelongsToForForm(belongsToSource),
    content: ensureLandingContentShape(landing.contentDraft),
    templateId: landing.templateId ?? "",
    themeId: landing.themeId ?? undefined,
  };
};

// export const fillLandingFormFromPayload = (payload: LandingCreateInput): LandingFormValues => ({
//   settings: {
//     merchantId: payload.merchantId,
//     name: payload.name,
//     slug: payload.slug,
//     status: "draft",
//   },
//   belongsTo: payload.belongsTo,
//   content: ensureLandingContentShape(payload.content),
//   templateId: payload.templateId ?? null,
// });

export const buildLandingPayload = (
  values: LandingFormShape,
  options?: BuildLandingPayloadOptions,
  locale: string = "en"
): LandingUpdateInput => {
  const baseContent = ensureLandingContentShape(values.content);
  const seededTemplateContent =
    options?.seedTemplateContent && baseContent.blocks.length === 0
      ? buildTemplateContent(values.templateId, locale)
      : null;

  const content = ensureLandingContentShape(
    seededTemplateContent ?? baseContent
  );

  const belongsTo = ensureBelongsToForForm(values.belongsTo);
  return {
    merchantId: values.settings.merchantId,
    placeId: belongsTo.type === "place" ? belongsTo.placeId : undefined,
    campaignId: belongsTo.type === "campaign" ? belongsTo.campaignId : undefined,
    name: values.settings.name,
    content,
    templateId: values.templateId ?? null,
    themeId: values.themeId ?? null,
  };
};
