import { z } from "zod";
import { LandingBlockSchema } from "../blocks";


/** =========================
 *  Enums & Basic Schemas
 *  ========================= */
export const landingStatusEnum = z.enum(["draft", "published", "archived"]);
export const landingLayoutEnum = z.enum(["full", "boxed"]);

export const LandingContentSchema = z.object({
  layout: z.enum(["full", "boxed"]).default("full"),
  templateId: z.string().nullable().optional(),
  blocks: z.array(LandingBlockSchema).min(1, "At least one block is required"),
});

/** =========================
 *  Input vs Output Types
 *  ========================= */

export type LandingBlockInput = z.input<typeof LandingBlockSchema>;
export type LandingBlockOutput = z.output<typeof LandingBlockSchema>;

export type LandingContentInput = z.input<typeof LandingContentSchema>;
export type LandingContentOutput = z.output<typeof LandingContentSchema>;

/** Alias (si utilisé ailleurs) */
export type LandingContent = LandingContentOutput;

export const createLandingContentDefaults = (): LandingContentInput => ({
  layout: "full",
  templateId: null,
  blocks: [],
});

export const ensureLandingContentShape = (
  value?: LandingContentInput | LandingContent | null
): LandingContent => {
  const content = value ?? createLandingContentDefaults();
  return {
    layout: content.layout ?? "full",
    templateId: content.templateId ?? null,
    blocks: Array.isArray(content.blocks) ? content.blocks : [],
  };
};

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
const alphanumericSlug = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-zA-Z0-9]+$/, "Slug must contain only letters and numbers");

export const landingSettingsSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  slug: alphanumericSlug,
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
  slug: alphanumericSlug,
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


export const mapLandingFormToPayload = (form: LandingFormLikeValues): LandingCreateInput => {
  const contentInput = "content" in form ? form.content : undefined;
  return {
    merchantId: form.settings.merchantId,
    name: form.settings.name,
    slug: form.settings.slug,
    status: form.settings.status ?? "draft",
    content: ensureLandingContentShape(contentInput),
    belongsTo: form.belongsTo,
  };
};

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
    slug: "",
    status: "draft",
  },
  belongsTo: emptyBelongsTo(args?.belongsTo),
  content: createLandingContentDefaults(),
});

export const createLandingCreateFormDefaults = (args?: {
  merchantId?: string;
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal;
}): LandingCreateFormValues => ({
  settings: {
    merchantId: args?.merchantId ?? "",
    name: "",
    slug: "",
    status: "draft",
  },
  belongsTo: emptyBelongsTo(args?.belongsTo),
});

export const ensureBelongsToForForm = (
  belongsTo?: LandingBelongsTo | LandingBelongsToExternal | null
): LandingBelongsTo => toInternalBelongsTo(belongsTo);

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
