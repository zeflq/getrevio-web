/**
 * Resolve block description from KIND i18n
 */

import { getBlockI18n } from "./getBlockI18n";
import type { Locale } from "./types";

/**
 * Resolve the description for a block from KIND i18n
 *
 * @param kind - The block kind (e.g., "empty")
 * @param locale - The locale to use (defaults to "en")
 * @returns The resolved description, or undefined if none exists
 *
 * @example
 * resolveBlockDescription("empty", "en") // => "An empty container for addons"
 */
export function resolveBlockDescription(
  kind: string,
  locale: Locale = "en"
): string | undefined {
  // Try base KIND i18n (portable)
  const kindI18n = getBlockI18n(kind);
  if (kindI18n?.description?.[locale]) {
    return kindI18n.description[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && kindI18n?.description?.en) {
    return kindI18n.description.en;
  }

  // No description available
  return undefined;
}
