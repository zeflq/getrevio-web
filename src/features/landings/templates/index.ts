/**
 * Landing Templates - Public API
 *
 * This file provides the public API for landing templates.
 * Uses separated structure:
 * - definitions/ - Pure structure (blocks, addons, config)
 * - meta/ - Label/description overrides for KIND i18n
 * - defaults/ - Field data with locale support
 * - translation/ - Runtime combination logic
 *
 * Templates are built per-locale with:
 * 1. Meta overrides for KIND i18n (label/description)
 * 2. Locale-extracted field data from defaults
 * 3. Primitive config values
 */

import type { LandingTemplate } from "./types";

// Import separated parts for slotTemplate
import { slotTemplateDefinition } from "./definitions/slotTemplate";
import { slotTemplateMeta } from "./meta/slotTemplate.meta";
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
        slotTemplateMeta,
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
      slotTemplateMeta,
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
