import { z } from "zod";
import {
  LandingContentCreateSchema,
  LandingContentSchema,
} from "./landingContentSchema";

export const landingStatusEnum = z.enum(["draft", "published", "archived"]);
export const landingLayoutEnum = z.enum(["full", "boxed"]);

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

/** Format EXTERNE (ex: API): { type, id, label?, googlePlaceId? } */
export type LandingBelongsToExternal = {
  type: "place" | "campaign";
  id: string;
  label?: string | null;
  googlePlaceId?: string | null;
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

export const createLandingFormSchema = (isEdit: boolean) =>
  landingFormCoreSchema
    .extend({
      content: isEdit ? LandingContentSchema : LandingContentCreateSchema,
      templateId: z.string().min(1, "template is required"),
      themeId: z.string().nullable().optional(),
    })
;

export const landingFormSchema = createLandingFormSchema(false);



/** Inputs/Outputs des formulaires */
export type LandingFormValues = z.input<typeof landingFormSchema>; // INPUT (style optionnel)
export type LandingFormData = z.output<typeof landingFormSchema>; // OUTPUT (style requis)

/** =========================
 *  Payloads & API Schemas
 *  ========================= */
const landingPayloadCore = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  slug: alphanumericSlug,
  //status: landingStatusEnum.default("draft"),
  content: LandingContentSchema,
  belongsTo: landingBelongsToSchema,
  templateId: z.string().nullable().optional(),
  themeId: z.string().nullable().optional(),
});

// export const landingPayloadSchema = landingPayloadCore.extend({
//   content: LandingContentSchema,
// });

export const landingCreateSchema = landingPayloadCore.extend({
  content: LandingContentCreateSchema,
});
export const landingUpdateSchema = landingPayloadCore.partial();

export type LandingCreateInput = z.input<typeof landingCreateSchema>; // INPUT
export type LandingUpdateInput = z.input<typeof landingUpdateSchema>; // INPUT (partial)



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
