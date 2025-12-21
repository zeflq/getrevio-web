/**
 * Resolve field placeholder from KIND i18n
 *
 * Field placeholders are shared across all instances (KIND-level),
 * they are NOT overridden per instance.
 */

import { getAddonI18n } from "./getAddonI18n";
import type { Locale } from "./types";

/**
 * Resolve the placeholder for an inspector field from KIND i18n
 *
 * @param kind - The addon kind (e.g., "lotteryAddon")
 * @param fieldName - The field name (e.g., "lotteryId", "contactMethod")
 * @param locale - The locale to use (defaults to "en")
 * @returns The resolved field placeholder, or undefined if not found
 *
 * @example
 * resolveFieldPlaceholder("lotteryAddon", "lotteryId", "en")
 * // => "Select a lottery"
 *
 * @example
 * resolveFieldPlaceholder("lotteryAddon", "contactMethod", "fr")
 * // => "Sélectionnez une méthode"
 *
 * @example
 * resolveFieldPlaceholder("unknownAddon", "field", "en")
 * // => undefined
 */
export function resolveFieldPlaceholder(
  kind: string,
  fieldName: string,
  locale: Locale = "en"
): string | undefined {
  const kindI18n = getAddonI18n(kind);

  // Try to get field placeholder in requested locale
  const fieldI18n = kindI18n?.inspector?.fields?.[fieldName];
  if (fieldI18n?.placeholder?.[locale]) {
    return fieldI18n.placeholder[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && fieldI18n?.placeholder?.en) {
    return fieldI18n.placeholder.en;
  }

  return undefined;
}
