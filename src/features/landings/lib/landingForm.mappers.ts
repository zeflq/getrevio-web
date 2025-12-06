import {
  type LandingBelongsTo,
  type LandingBelongsToExternal,
  type LandingCreateInput,
  type LandingFormValues,
  type LandingUpdateInput,
} from "../model/landingSchema";
import {
  createLandingContentDefaults,
  ensureLandingContentShape,
  type LandingContentInput,
} from "../model/landingContentSchema";
import { createBlockByKind } from "../blocks";
import { createAddonByKind } from "@/features/landings/addons";
import { getTemplateById } from "../templates";
import type { LandingListItem } from "../server/mappers";
import { TranslationFn } from "../utils/translationDefaults";

type LandingFormShape = LandingFormValues;

type BuildLandingPayloadOptions = {
  seedTemplateContent?: boolean;
};

const buildTemplateContent = (
  templateId?: string | null,
  translator?: TranslationFn
): LandingContentInput | null => {
  const template = getTemplateById(templateId);
  if (!template) return null;

  // ✅ Only pick fixed blocks
  const blocks = template.blocks
    .filter((definition) => definition.mode === "fixed")
    .map((definition) => {
      const block = createBlockByKind(
        definition.kind,
        definition.defaultData as any,
        definition.addons?.filter((addonDef) => addonDef.mode === "fixed"),
        translator
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
): LandingBelongsTo => {
  if (!src) return { type: "place", placeId: "" };

  if ("placeId" in src || "campaignId" in src) {
    return src.type === "campaign"
      ? { type: "campaign", campaignId: src.campaignId ?? "" }
      : { type: "place", placeId: src.placeId ?? "" };
  }

  return src.type === "campaign"
    ? { type: "campaign", campaignId: src.id ?? "" }
    : { type: "place", placeId: src.id ?? "" };
};

export const ensureBelongsToForForm = (
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal | null
): LandingBelongsTo => toInternalBelongsTo(belongsTo);

export const createLandingFormDefaults = (args?: {
  merchantId?: string;
  belongsTo?: any;
}): LandingFormValues => ({
  settings: {
    merchantId: args?.merchantId ?? "",
    name: "",
    slug: "",
    status: "draft",
  },
  belongsTo: ensureBelongsToForForm(args?.belongsTo),
  content: createLandingContentDefaults(),
  templateId: "",
  themeId: undefined,
});

export const fillLandingFormFromEntity = (landing?: LandingListItem | null): LandingFormValues => {
  if (!landing) {
    return createLandingFormDefaults();
  }

  return {
    settings: {
      merchantId: landing.merchantId ?? "",
      name: landing.name ?? "",
      slug: landing.slug ?? "",
      status: landing.status ?? "draft",
    },
    belongsTo: ensureBelongsToForForm(landing.belongsTo ?? undefined),
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
  translator?: TranslationFn
): LandingUpdateInput => {
  const baseContent = ensureLandingContentShape(values.content);
  const seededTemplateContent =
    options?.seedTemplateContent && baseContent.blocks.length === 0
      ? buildTemplateContent(values.templateId, translator)
      : null;

  const content = ensureLandingContentShape(
    seededTemplateContent ?? baseContent
  );

  return {
    merchantId: values.settings.merchantId,
    name: values.settings.name,
    slug: values.settings.slug,
    content,
    belongsTo: values.belongsTo,
    templateId: values.templateId ?? null,
    themeId: values.themeId ?? null,
  };
};
