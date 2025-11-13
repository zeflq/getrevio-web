"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { FieldArrayWithId } from "react-hook-form";

import type { LandingFormValues } from "../../model/landingSchema";

export type LandingBlockField = FieldArrayWithId<LandingFormValues, "content.blocks", "id">;

export function useBlocksFieldArray() {
  const { control } = useFormContext<LandingFormValues>();
  const fieldArray = useFieldArray({
    name: "content.blocks",
    control,
  });

  const remove = (index: number) => {
    const target = fieldArray.fields[index];
    if (target?.__templateFixed) {
      return;
    }
    fieldArray.remove(index);
  };

  return {
    ...fieldArray,
    fields: fieldArray.fields as LandingBlockField[],
    remove,
  };
}
