import {
  createLandingFormDefaults,
  ensureBelongsToForForm,
  ensureLandingContentShape,
  mapLandingFormToPayload,
  type LandingCreateFormValues,
  type LandingCreateInput,
  type LandingFormValues,
} from "../model/landingSchema";
import type { LandingListItem } from "../server/mappers";

type LandingFormShape = LandingFormValues | LandingCreateFormValues;

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
    content: ensureLandingContentShape(landing.content),
  };
};

export const fillLandingFormFromPayload = (payload: LandingCreateInput): LandingFormValues => ({
  settings: {
    merchantId: payload.merchantId,
    name: payload.name,
    slug: payload.slug,
    status: payload.status ?? "draft",
  },
  belongsTo: payload.belongsTo,
  content: ensureLandingContentShape(payload.content),
});

export const buildLandingPayload = (values: LandingFormShape): LandingCreateInput => {
  if ("content" in values) {
    return mapLandingFormToPayload({
      ...values,
      content: ensureLandingContentShape(values.content),
    });
  }

  return mapLandingFormToPayload(values);
};
