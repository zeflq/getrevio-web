/**
 * Resolve field label from KIND i18n
 *
 * Field labels are shared across all instances (KIND-level),
 * they are NOT overridden per instance.
 */

import { getAddonI18n } from "./getAddonI18n";
import type { Locale } from "./types";

/**
 * Resolve the label for an inspector field from KIND i18n
 *
 * @param kind - The addon kind (e.g., "lotteryAddon")
 * @param fieldName - The field name (e.g., "lotteryId", "contactMethod")
 * @param locale - The locale to use (defaults to "en")
 * @returns The resolved field label
 *
 * @example
 * resolveFieldLabel("lotteryAddon", "lotteryId", "en")
 * // => "Lottery"
 *
 * @example
 * resolveFieldLabel("lotteryAddon", "contactMethod", "fr")
 * // => "Méthode de contact"
 *
 * @example
 * resolveFieldLabel("unknownAddon", "field", "en")
 * // => "field" (fallback to field name)
 */
export function resolveFieldLabel(
  kind: string,
  fieldName: string,
  locale: Locale = "en"
): string {
  const kindI18n = getAddonI18n(kind);

  // Try to get field label in requested locale
  const fieldI18n = kindI18n?.inspector?.fields?.[fieldName];
  if (fieldI18n?.label?.[locale]) {
    return fieldI18n.label[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && fieldI18n?.label?.en) {
    return fieldI18n.label.en;
  }

  // Ultimate fallback: return field name as-is
  return fieldName;
}
