/**
 * Resolve addon description from KIND i18n
 *
 * Note: Descriptions are typically NOT overridden per instance,
 * they come from the base KIND i18n only.
 */

import { getAddonI18n } from "./getAddonI18n";
import type { Locale } from "./types";

/**
 * Resolve the description for an addon from KIND i18n
 *
 * @param kind - The addon kind (e.g., "lotteryAddon")
 * @param locale - The locale to use (defaults to "en")
 * @returns The resolved description, or undefined if not found
 *
 * @example
 * resolveAddonDescription("lotteryAddon", "en")
 * // => "Embed a lottery game so visitors can spin and win directly from this landing."
 *
 * @example
 * resolveAddonDescription("lotteryAddon", "fr")
 * // => "Ajoutez un jeu de loterie à cette landing..."
 */
export function resolveAddonDescription(
  kind: string,
  locale: Locale = "en"
): string | undefined {
  const kindI18n = getAddonI18n(kind);

  // Try requested locale
  if (kindI18n?.description?.[locale]) {
    return kindI18n.description[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && kindI18n?.description?.en) {
    return kindI18n.description.en;
  }

  return undefined;
}
