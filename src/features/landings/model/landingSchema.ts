import { z } from "zod";

export const landingStatusEnum = z.enum(["draft", "published", "archived"]);
export const landingLayoutEnum = z.enum(["full", "boxed"]);

export const CtaSchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  url: z.string().url("Must be a valid URL"),
  style: z.enum(["primary", "secondary"]).default("primary"),
});

/** Content blocks */
const HeroBlock = z.object({
  kind: z.literal("hero"),
  title: z.string().min(1, "Hero title is required"),
  subtitle: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  ctas: z.array(CtaSchema).max(2).optional(),
});

export const LandingContentSchema = z.object({
  layout: z.enum(["full", "boxed"]).default("full"),
  blocks: z.array(HeroBlock).min(1, "At least one block is required"),
});

export type LandingContent = z.infer<typeof LandingContentSchema>;

const defaultHeroBlock = (): LandingContent["blocks"][number] => ({
  kind: "hero",
  title: "",
  subtitle: "",
  imageUrl: "",
  ctas: [
    { label: "", url: "", style: "primary" },
    { label: "", url: "", style: "secondary" },
  ],
});

export const createDefaultLandingContent = (): LandingContent => ({
  layout: "full",
  blocks: [defaultHeroBlock()],
});

export const ensureLandingContentShape = (content?: LandingContent | null): LandingContent => {
  const base = createDefaultLandingContent();
  if (!content || !Array.isArray(content.blocks) || content.blocks.length === 0) {
    return base;
  }

  const hero = content.blocks[0];
  const normalizedHero = {
    kind: "hero" as const,
    title: hero?.title ?? "",
    subtitle: hero?.subtitle ?? "",
    imageUrl: hero?.imageUrl ?? "",
    ctas: (hero?.ctas ?? []).slice(0, 2).map((cta, index) => ({
      label: cta?.label ?? "",
      url: cta?.url ?? "",
      style: (cta?.style ?? (index === 0 ? "primary" : "secondary")) as "primary" | "secondary",
    })),
  };

  while (normalizedHero.ctas.length < 2) {
    normalizedHero.ctas.push({ label: "", url: "", style: normalizedHero.ctas.length === 0 ? "primary" : "secondary" });
  }

  return {
    layout: content.layout ?? base.layout,
    blocks: [normalizedHero],
  };
};

/** UI form schema (three tabs) */
export const landingSettingsSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  status: landingStatusEnum.default("draft"),
});

export const landingFormSchema = z.object({
  settings: landingSettingsSchema,
  content: LandingContentSchema,
});

export type LandingFormValues = z.input<typeof landingFormSchema>;
export type LandingFormData = z.output<typeof landingFormSchema>;

/** Server-side schemas (flattened payload) */
export const landingCreateSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  status: landingStatusEnum.default("draft"),
  content: LandingContentSchema,
});

export const landingUpdateSchema = landingCreateSchema.partial();

export type LandingCreateInput = z.input<typeof landingCreateSchema>;
export type LandingUpdateInput = z.input<typeof landingUpdateSchema>;

export const mapLandingFormToPayload = (form: LandingFormValues): LandingCreateInput => ({
  merchantId: form.settings.merchantId,
  name: form.settings.name,
  status: form.settings.status ?? "draft",
  content: form.content,
});

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
