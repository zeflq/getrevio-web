import * as React from "react";
import { useFormContext } from "react-hook-form";

import { deriveContentWarnings, ensureLandingContentShape } from "../../model/landingSchema";
import type { LandingFormValues } from "../../model/landingSchema";

export function useEditorWarnings() {
  const { watch } = useFormContext<LandingFormValues>();
  const content = watch("content");

  return React.useMemo(() => {
    const normalized = ensureLandingContentShape(content);
    return deriveContentWarnings(normalized);
  }, [content]);
}
