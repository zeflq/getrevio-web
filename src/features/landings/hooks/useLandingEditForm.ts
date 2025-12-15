"use client";

import { useEditPageForm } from "@/hooks/useEditPageForm";
import { useReadableError } from "@/lib/useReadableError";
import { useTranslations } from "next-intl";

import {
  createLandingFormSchema,
  type LandingFormValues,
} from "../model/landingSchema";
import { useLandingItem, useUpdateLanding } from "./useLandingCrud";
import {
  buildLandingPayload,
  createLandingFormDefaults,
  fillLandingFormFromEntity,
} from "../lib/landingForm.mappers";

/**
 * Form logic for landing edit pages.
 * Uses the generic useEditPageForm hook with landing-specific configuration.
 */
export function useLandingEditForm(id: string, isEdit: boolean = true) {
  const readableError = useReadableError();
  const tEditor = useTranslations("landings.editor");

  const editForm = useEditPageForm({
    id,
    useItemQuery: useLandingItem,
    useUpdateMutation: useUpdateLanding,
    schema: createLandingFormSchema(isEdit),

    entityToFormValues: fillLandingFormFromEntity,

    formValuesToPayload: (values) => buildLandingPayload(values, {}, tEditor),

    defaultValues: createLandingFormDefaults(),

    successMessage: "Landing updated successfully",
    errorMessage: "Failed to update landing",
    readableError,
  });

  return {
    ...editForm,
    landing: editForm.entity,
  };
}
