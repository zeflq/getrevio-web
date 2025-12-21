/**
 * Resolve addon label with smart fallback chain:
 * 1. Template instance override (landings.templates.{templateId}.instances.{instanceId}.label)
 * 2. Base KIND i18n (from addon's i18n.ts file)
 * 3. Kind as fallback
 */

import { getAddonI18n } from "./getAddonI18n";
import type { Locale } from "./types";

/**
 * Resolve the label for an addon with instance override support
 *
 * @param kind - The addon kind (e.g., "lotteryAddon")
 * @param instanceId - The specific instance ID (for template overrides)
 * @param templateId - The template ID (for template overrides)
 * @param locale - The locale to use (defaults to "en")
 * @param t - Next-intl translation function (optional, for checking overrides)
 * @returns The resolved label
 *
 * @example
 * // Without override - returns KIND i18n
 * resolveAddonLabel("lotteryAddon", undefined, undefined, "en")
 * // => "Lottery"
 *
 * @example
 * // With instance override
 * resolveAddonLabel("lotteryAddon", "lottery-section", "slotTemplate", "en", t)
 * // => "Prize Wheel" (if override exists)
 * // => "Lottery" (if no override)
 */
export function resolveAddonLabel(
  kind: string,
  instanceId?: string,
  templateId?: string,
  locale: Locale = "en",
  t?: (key: string) => string
): string {
  // 1. Try template instance override (INSTANCE i18n)
  if (t && templateId && instanceId) {
    const overrideKey = `landings.templates.${templateId}.instances.${instanceId}.label`;
    try {
      const override = t(overrideKey);
      // Check if translation exists (next-intl returns the key if not found)
      if (override !== overrideKey) {
        return override;
      }
    } catch {
      // Ignore errors, fall through to KIND i18n
    }
  }

  // 2. Try base KIND i18n (portable)
  const kindI18n = getAddonI18n(kind);
  if (kindI18n?.label?.[locale]) {
    return kindI18n.label[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && kindI18n?.label?.en) {
    return kindI18n.label.en;
  }

  // 3. Ultimate fallback: return kind itself
  return kind;
}
