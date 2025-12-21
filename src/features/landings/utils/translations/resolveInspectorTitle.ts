/**
 * Resolve inspector title with smart fallback chain:
 * 1. Template instance override (optional)
 * 2. Base KIND i18n inspector title
 * 3. Fallback to addon label
 */

import { getAddonI18n } from "./getAddonI18n";
import { resolveAddonLabel } from "./resolveAddonLabel";
import type { Locale } from "./types";

/**
 * Resolve the inspector panel title for an addon
 *
 * @param kind - The addon kind (e.g., "lotteryAddon")
 * @param instanceId - The specific instance ID (for template overrides)
 * @param templateId - The template ID (for template overrides)
 * @param locale - The locale to use (defaults to "en")
 * @param t - Next-intl translation function (optional, for checking overrides)
 * @returns The resolved inspector title
 *
 * @example
 * // Uses KIND i18n inspector title
 * resolveInspectorTitle("lotteryAddon", undefined, undefined, "en")
 * // => "Lottery Settings"
 *
 * @example
 * // With instance override (if exists)
 * resolveInspectorTitle("lotteryAddon", "lottery-section", "slotTemplate", "en", t)
 * // => "Prize Wheel Settings" (if override exists)
 * // => "Lottery Settings" (if no override)
 */
export function resolveInspectorTitle(
  kind: string,
  instanceId?: string,
  templateId?: string,
  locale: Locale = "en",
  t?: (key: string) => string
): string {
  // 1. Try template instance override (optional, for context-specific titles)
  if (t && templateId && instanceId) {
    const overrideKey = `landings.templates.${templateId}.instances.${instanceId}.inspector.title`;
    try {
      const override = t(overrideKey);
      if (override !== overrideKey) {
        return override;
      }
    } catch {
      // Ignore errors, fall through to KIND i18n
    }
  }

  // 2. Try base KIND i18n inspector title
  const kindI18n = getAddonI18n(kind);
  if (kindI18n?.inspector?.title?.[locale]) {
    return kindI18n.inspector.title[locale]!;
  }

  // Fallback to English if locale not found
  if (locale !== "en" && kindI18n?.inspector?.title?.en) {
    return kindI18n.inspector.title.en;
  }

  // 3. Ultimate fallback: use addon label
  return resolveAddonLabel(kind, instanceId, templateId, locale, t);
}
