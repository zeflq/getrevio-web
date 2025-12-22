/**
 * Landing Templates - Public API (KIND Pattern)
 *
 * This file provides the public API for landing templates.
 * It uses the new separated structure with KIND i18n pattern:
 * - definitions/ - Pure structure (blocks, addons, config)
 * - i18n/ - Actual translations in all languages (KIND pattern)
 * - defaults/ - Default data values
 * - translation/ - Runtime combination logic
 *
 * Templates are built per-locale to contain actual translated strings.
 * When locale changes, templates are rebuilt with new translations.
 */

import type { LandingTemplate } from "./types";

// Import separated parts for slotTemplate
import { slotTemplateDefinition } from "./definitions/slotTemplate";
import { slotTemplateI18n } from "./i18n/slotTemplate.i18n";
import { slotTemplateDefaults } from "./defaults/slotTemplate.defaults";
import { translateTemplate } from "./translation/translateTemplate";

/**
 * Get template by ID for a specific locale
 * Builds template with actual translations for the given locale
 *
 * @param id - Template ID (e.g., "slotTemplate")
 * @param locale - Target locale (e.g., "en", "fr", "ar")
 * @returns The template with actual translations, or undefined if not found
 *
 * @example
 * const template = getTemplateByIdForLocale("slotTemplate", "fr");
 * // template.blocks[0].label === "Page 1" (actual French text)
 */
export function getTemplateByIdForLocale(
  id: string | null | undefined,
  locale: string
): LandingTemplate | undefined {
  if (!id) return undefined;

  switch (id) {
    case "slotTemplate":
      return translateTemplate(
        slotTemplateDefinition,
        slotTemplateI18n,
        slotTemplateDefaults,
        locale
      );
    default:
      return undefined;
  }
}

/**
 * Get a template by ID (backwards compatibility)
 * Defaults to English locale
 *
 * @param id - Template ID (e.g., "slotTemplate")
 * @returns The template with English translations, or undefined if not found
 *
 * @deprecated Use getTemplateByIdForLocale or useTemplate hook instead
 */
export const getTemplateById = (id?: string | null) =>
  getTemplateByIdForLocale(id, "en");

/**
 * Get all available templates for a specific locale
 *
 * @param locale - Target locale
 * @returns Array of templates with actual translations
 */
export function getAllTemplatesForLocale(locale: string): LandingTemplate[] {
  return [
    translateTemplate(
      slotTemplateDefinition,
      slotTemplateI18n,
      slotTemplateDefaults,
      locale
    ),
  ];
}

/**
 * All available landing templates (English - backwards compatibility)
 *
 * @deprecated Use getAllTemplatesForLocale instead
 */
export const landingTemplates: LandingTemplate[] = getAllTemplatesForLocale("en");
