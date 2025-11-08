import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { deriveContentWarnings, ensureLandingContentShape } from "../../model/landingSchema";
import type { LandingFormValues } from "../../model/landingSchema";

export function useEditorWarnings() {
  const { watch } = useFormContext<LandingFormValues>();
  const content = watch("content");
  const t = useTranslations("landings.editor");

  return React.useMemo(() => {
    const normalized = ensureLandingContentShape(content);
    return deriveContentWarnings(normalized).map((key) => t(key));
  }, [content, t]);
}
