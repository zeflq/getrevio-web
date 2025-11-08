import { z } from "zod";

import { createDefaultLandingContent } from "../lib/landingContent.presets";
import { ensureLandingContentShape } from "../lib/landingContent.normalizers";

/** =========================
 *  Enums & Basic Schemas
 *  ========================= */
export const landingStatusEnum = z.enum(["draft", "published", "archived"]);
export const landingLayoutEnum = z.enum(["full", "boxed"]);

export const CtaSchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  url: z.string().url("Must be a valid URL"),
  style: z.enum(["primary", "secondary"]).default("primary"),
});

/** =========================
 *  Content Blocks & Content
 *  ========================= */
export const SimpleHeroBlock = z.object({
  kind: z.literal("simpleHero"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
});

export const HeroWithCtaBlock = z.object({
  kind: z.literal("heroWithCta"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  ctas: z.array(CtaSchema).min(1).max(2),
});

export const LegalTextBlock = z.object({
  kind: z.literal("legalText"),
  text: z.string().min(1, "Text is required"),
});

export const GameBlock = z.object({
  kind: z.literal("game"),
  ctaLabel: z.string().optional(),
});

export const LandingBlockSchema = z.discriminatedUnion("kind", [
  SimpleHeroBlock,
  HeroWithCtaBlock,
  LegalTextBlock,
  GameBlock,
]);

export const LandingContentSchema = z.object({
  layout: z.enum(["full", "boxed"]).default("full"),
  blocks: z.array(LandingBlockSchema).min(1, "At least one block is required"),
});

/** =========================
 *  Input vs Output Types
 *  ========================= */
export type CtaInput = z.input<typeof CtaSchema>;
export type CtaOutput = z.output<typeof CtaSchema>;

export type LandingBlockInput = z.input<typeof LandingBlockSchema>;
export type LandingBlockOutput = z.output<typeof LandingBlockSchema>;

export type LandingContentInput = z.input<typeof LandingContentSchema>;
export type LandingContentOutput = z.output<typeof LandingContentSchema>;

/** Alias (si utilisé ailleurs) */
export type LandingContent = LandingContentOutput;

/** =========================
 *  BelongsTo Schemas & Types
 *  ========================= */
export const landingBelongsToSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("place"),
    placeId: z.string().min(1, "Place is required"),
  }),
  z.object({
    type: z.literal("campaign"),
    campaignId: z.string().min(1, "Campaign is required"),
  }),
]);

export type LandingBelongsTo = z.infer<typeof landingBelongsToSchema>;

/** Format EXTERNE (ex: API): { type, id, label? } */
export type LandingBelongsToExternal = {
  type: "place" | "campaign";
  id: string;
  label?: string | null;
};

/** Normaliseur générique vers le format interne */
const toInternalBelongsTo = (
  src?: LandingBelongsTo | LandingBelongsToExternal | null
): LandingBelongsTo => {
  if (!src) return { type: "place", placeId: "" };

  // Format interne déjà correct
  if ("placeId" in src || "campaignId" in src) {
    return src.type === "campaign"
      ? { type: "campaign", campaignId: src.campaignId ?? "" }
      : { type: "place", placeId: src.placeId ?? "" };
  }

  // Format externe (id -> placeId/campaignId)
  return src.type === "campaign"
    ? { type: "campaign", campaignId: src.id ?? "" }
    : { type: "place", placeId: src.id ?? "" };
};

/** =========================
 *  Settings & Form Schemas
 *  ========================= */
export const landingSettingsSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  status: landingStatusEnum.default("draft"),
});

const landingFormCoreSchema = z.object({
  settings: landingSettingsSchema,
  belongsTo: landingBelongsToSchema,
});

export const landingFormSchema = landingFormCoreSchema.extend({
  content: LandingContentSchema,
});

export const landingCreateFormSchema = landingFormCoreSchema;

/** Inputs/Outputs des formulaires */
export type LandingFormValues = z.input<typeof landingFormSchema>; // INPUT (style optionnel)
export type LandingFormData = z.output<typeof landingFormSchema>; // OUTPUT (style requis)
export type LandingCreateFormValues = z.input<typeof landingCreateFormSchema>;

/** =========================
 *  Payloads & API Schemas
 *  ========================= */
const landingPayloadSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  status: landingStatusEnum.default("draft"),
  content: LandingContentSchema,
  belongsTo: landingBelongsToSchema,
});

export const landingCreateSchema = landingPayloadSchema;
export const landingUpdateSchema = landingPayloadSchema.partial();

export type LandingCreateInput = z.input<typeof landingCreateSchema>; // INPUT
export type LandingUpdateInput = z.input<typeof landingUpdateSchema>; // INPUT (partial)

/** =========================
 *  Mapping & Helpers
 *  ========================= */
type LandingFormLikeValues = LandingFormValues | LandingCreateFormValues;

const hasContent = (form: LandingFormLikeValues): form is LandingFormValues =>
  "content" in form && !!form.content;

/** Résout toujours en OUTPUT strict */
const resolveContent = (form: LandingFormLikeValues): LandingContentOutput => {
  if (hasContent(form)) {
    return ensureLandingContentShape(form.content);
  }
  if ((form.settings.status ?? "draft") === "published") {
    throw new Error("Landing content is required before publishing.");
  }
  return createDefaultLandingContent();
};

export const mapLandingFormToPayload = (form: LandingFormLikeValues): LandingCreateInput => ({
  merchantId: form.settings.merchantId,
  name: form.settings.name,
  status: form.settings.status ?? "draft",
  content: resolveContent(form),
  belongsTo: form.belongsTo,
});

/** emptyBelongsTo accepte désormais interne ou externe */
const emptyBelongsTo = (
  seed?: LandingBelongsTo | LandingBelongsToExternal
): LandingBelongsTo => {
  return toInternalBelongsTo(seed);
};

export const createLandingFormDefaults = (args?: {
  merchantId?: string;
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal;
}): LandingFormValues => ({
  settings: {
    merchantId: args?.merchantId ?? "",
    name: "",
    status: "draft",
  },
  belongsTo: emptyBelongsTo(args?.belongsTo),
  content: createDefaultLandingContent(), // output est assignable à input
});

export const createLandingCreateFormDefaults = (args?: {
  merchantId?: string;
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal;
}): LandingCreateFormValues => ({
  settings: {
    merchantId: args?.merchantId ?? "",
    name: "",
    status: "draft",
  },
  belongsTo: emptyBelongsTo(args?.belongsTo),
});

export const ensureBelongsToForForm = (
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal | null
): LandingBelongsTo => toInternalBelongsTo(belongsTo);

export { createDefaultLandingContent } from "../lib/landingContent.presets";
export {
  ensureLandingContentShape,
  deriveContentWarnings,
} from "../lib/landingContent.normalizers";

/** =========================
 *  Filters
 *  ========================= */
export const landingFiltersSchema = z
  .object({
    q: z.string().optional(),
    status: landingStatusEnum.optional(),
    merchantId: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["name", "createdAt", "status"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
    _lite: z.coerce.boolean().optional(),
  })
  .transform((params) => ({
    q: params.q,
    status: params.status,
    merchantId: params.merchantId,
    page: params._page ?? 1,
    pageSize: params._limit ?? 10,
    sort: params._sort ?? ("createdAt" as const),
    order: params._order ?? ("desc" as const),
    lite: params._lite ?? false,
  }));

export type LandingFilters = z.output<typeof landingFiltersSchema>;
