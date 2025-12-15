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

export const lotteryGiftSchema = z.object({
  id: z.string().min(1, "Gift ID is required"),
  name: z
    .string()
    .min(3, "Gift must be at least 3 characters")
    .regex(
      /^[\p{L}0-9 ]+$/u,
      "Gift name can only contain letters, numbers, and spaces"
    ),
  kind: z.enum(["free_item", "discount", "credit", "other"]),
  weight: z
    .coerce.number()
    .int()
    .min(1, "Weight must be at least 1")
    .max(100, "Weight cannot exceed 100"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  rewardLabel: z
    .string()
    .min(3, "Reward must be at least 3 characters")
    .regex(
      /^[\p{L}0-9 ]+$/u,
      "Reward label can only contain letters, numbers, and spaces"
    ),
  minPurchaseAmount: z
    .coerce
    .number()
    .int()
    .min(0)
    .max(1000, "Validity cannot exceed 1000")
    .optional(),
  minPurchaseCurrency: z.string().optional(),
  validityDays: z
    .coerce.number()
    .int()
    .min(2, "Validity must be at least 2 day")
    .max(365, "Validity cannot exceed 365 days")
    .optional(),
});

export const lotteryCooldownSchema = z.enum(["one_hour", "one_day", "one_week"]);

export type LotteryCooldownFormValue = z.infer<typeof lotteryCooldownSchema>;

const lotteryConfigBaseSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .regex( /^[\p{L}0-9 ]+$/u, "Name can only contain letters, numbers, and spaces"),
  enabled: booleanString,
  playLimitPerUser: z
    .coerce.number()
    .int()
    .min(1, "Play limit must be at least 1")
    .max(10, "Play limit cannot exceed 10"),
  cooldown: lotteryCooldownSchema,
  noWinWeight: z
    .coerce.number()
    .int()
    .min(0, "Weight must be non-negative")
    .max(100, "No-win weight cannot exceed 100"),
  guaranteeWinOnFirstPlay: booleanString,
});

const lotteryGiftsSchema = z.array(lotteryGiftSchema);
const lotteryGiftsRequiredSchema = lotteryGiftsSchema.min(1, "Add at least one gift");

export const lotteryConfigCreateSchema = lotteryConfigBaseSchema.extend({
  gifts: lotteryGiftsSchema.default([]),
});

const lotteryConfigFormSchema = lotteryConfigBaseSchema.extend({
  gifts: lotteryGiftsRequiredSchema,
});

export const lotteryConfigUpdateSchema = lotteryConfigFormSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type LotteryGiftFormValue = z.infer<typeof lotteryGiftSchema>;
export type LotteryConfigCreateFormValues = z.infer<typeof lotteryConfigCreateSchema>;
export type LotteryConfigFormValues = z.infer<typeof lotteryConfigFormSchema>;

export const booleanOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
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
