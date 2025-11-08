import { useFieldArray, useFormContext } from "react-hook-form";

import type { LandingFormValues } from "../../model/landingSchema";

export function useBlocksFieldArray() {
  const form = useFormContext<LandingFormValues>();

  return useFieldArray({
    control: form.control,
    name: "content.blocks",
  });
}
