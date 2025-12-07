import { z } from "zod";

const booleanString = z.enum(["true", "false"]);

const coerceOptionalNumber = (min = 0) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  }, z.coerce.number().int().min(min).optional());

const optionalCurrency = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return value;
}, z.string().trim().optional());

const optionalUrl = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return value;
}, z.string().trim().url("Invalid URL").optional());

export const lotteryGiftSchema = z.object({
  id: z.string().min(1, "Gift ID is required"),
  name: z.string().min(1, "Gift name is required"),
  kind: z.enum(["free_item", "discount", "credit", "other"]),
  weight: z.coerce.number().int().min(1, "Weight must be at least 1"),
  imageUrl: optionalUrl,
  rewardLabel: z.string().min(1, "Reward label is required"),
  minPurchaseAmount: coerceOptionalNumber(0),
  minPurchaseCurrency: optionalCurrency,
  validityDays: coerceOptionalNumber(0),
});

export const lotteryCooldownSchema = z.enum(["one_hour", "one_day", "one_week"]);

export type LotteryCooldownFormValue = z.infer<typeof lotteryCooldownSchema>;

export const lotteryConfigBaseSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  enabled: booleanString,
  playLimitPerUser: z.coerce.number().int().min(1, "Play limit must be at least 1"),
  cooldown: lotteryCooldownSchema,
  noWinWeight: z.coerce.number().int().min(0, "Weight must be non-negative"),
  guaranteeWinOnFirstPlay: booleanString,
  contactMethod: z.enum(["email", "phone"]),
  gifts: z.array(lotteryGiftSchema).min(1, "Add at least one gift"),
});

export const lotteryConfigCreateSchema = lotteryConfigBaseSchema;
export const lotteryConfigUpdateSchema = lotteryConfigBaseSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type LotteryGiftFormValue = z.infer<typeof lotteryGiftSchema>;
export type LotteryConfigFormValues = z.infer<typeof lotteryConfigBaseSchema>;

export const booleanOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const lotteryContactMethodOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

export const lotteryCooldownOptions = [
  { value: "one_hour", label: "Every hour" },
  { value: "one_day", label: "Every day" },
  { value: "one_week", label: "Every week" },
];

export const lotteryFiltersSchema = z
  .object({
    q: z.string().optional(),
    merchantId: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["name", "createdAt"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
  })
  .transform((params) => ({
    q: params.q,
    merchantId: params.merchantId,
    page: params._page ?? 1,
    pageSize: params._limit ?? 10,
    sort: params._sort ?? ("createdAt" as const),
    order: params._order ?? ("desc" as const),
  }));

export type LotteryFilters = z.output<typeof lotteryFiltersSchema>;
