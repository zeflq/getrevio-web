/**
 * Resolve block label from KIND i18n
 * Template-specific labels are handled via __templateLabel (already translated)
 */

import { getBlockI18n } from "./getBlockI18n";
import type { Locale } from "./types";

/**
 * Resolve the label for a block from KIND i18n
 *
 * @param kind - The block kind (e.g., "empty")
 * @param locale - The locale to use (defaults to "en")
 * @returns The resolved label
 *
 * @example
 * resolveBlockLabel("empty", "en") // => "Page"
 * resolveBlockLabel("empty", "fr") // => "Page"
 */
export function resolveBlockLabel(
  kind: string,
  locale: Locale = "en"
): string {
  // Try base KIND i18n (portable)
  const kindI18n = getBlockI18n(kind);
  if (kindI18n?.label?.[locale]) {
    return kindI18n.label[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && kindI18n?.label?.en) {
    return kindI18n.label.en;
  }

  // Ultimate fallback: return kind itself
  return kind;
}
