import { z } from "zod";

import { placeCreateSchema } from "@/features/places/model/placeSchema";

const basePlaceSchema = placeCreateSchema
  .omit({ merchantId: true, slug: true })
  .extend({
    localName: placeCreateSchema.shape.localName,
    address: placeCreateSchema.shape.address.optional(),
    googlePlaceId: placeCreateSchema.shape.googlePlaceId.optional(),
  });

export const placeStepFormSchema = basePlaceSchema;

export const placeStepSubmitSchema = placeStepFormSchema.extend({
  organizationId: z.string(),
  placeId: z.string().optional(),
});

export type PlaceStepFormInput = z.input<typeof placeStepFormSchema>;
export type PlaceStepFormData = z.output<typeof placeStepFormSchema>;

export type PlaceStepData = PlaceStepFormData & {
  id?: string;
  googlePlaceId?: string;
};
