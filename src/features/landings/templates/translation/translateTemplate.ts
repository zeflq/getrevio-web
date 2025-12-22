/**
 * Template Translation Runtime
 *
 * Combines template structure, meta (KIND overrides), and defaults at runtime
 * to produce a LandingTemplate with actual values for the target locale.
 *
 * Architecture:
 * 1. Structure (definition): Pure block/addon structure
 * 2. Meta: Label/description overrides for KIND i18n
 * 3. Defaults: Field data with locale support
 *
 * Defaults support TWO patterns:
 * - Locale-based: { title: { en: "Spin", fr: "Tourner" } }
 * - Primitives: { showPlayButton: true }
 *
 * Process:
 * 1. Extract label from meta (overrides KIND i18n like emptyBlockI18n.label)
 * 2. Extract locale-specific values from defaults
 * 3. Keep primitives as-is
 * 4. Return template with actual values for the locale
 */

import type {
  TemplateDefinition,
  TemplateMeta,
  TemplateDefaults,
  LandingTemplate,
  TemplateBlockDefinition,
} from "../types";

// Helper types
type BlockMetaDef = {
  label?: Record<string, string>;
  description?: Record<string, string>;
  addons?: Record<
    string,
    {
      label?: Record<string, string>;
      description?: Record<string, string>;
    }
  >;
};

/**
 * Get block label from meta for locale
 * Returns the actual translated string
 */
function getBlockLabel(
  blockMeta: BlockMetaDef | undefined,
  locale: string
): string | undefined {
  if (!blockMeta?.label) return undefined;
  return blockMeta.label[locale] || blockMeta.label.en;
}

/**
 * Extract locale-specific values from defaults data
 * Supports both locale-based values and primitives:
 * - { title: { en: "...", fr: "..." } } → { title: "..." } (for locale)
 * - { showPlayButton: true } → { showPlayButton: true }
 */
function extractLocaleData(
  data: Record<string, unknown | Record<string, string>> | undefined,
  locale: string
): Record<string, unknown> {
  if (!data) return {};

  const result: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(data)) {
    // Check if value is a locale map (object with 'en', 'fr', etc.)
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      ("en" in value || "fr" in value || "ar" in value)
    ) {
      // Extract locale-specific value
      const localeMap = value as Record<string, string>;
      result[field] = localeMap[locale] || localeMap.en;
    } else {
      // Keep primitive value as-is
      result[field] = value;
    }
  }

  return result;
}

/**
 * Translate a template from its separated parts
 *
 * @param definition - Pure structure (blocks, addons, config)
 * @param meta - Meta data with label/description overrides for KIND i18n
 * @param defaults - Default data values with locale support
 * @param locale - Target locale (defaults to 'en')
 * @returns LandingTemplate with actual translations for the locale
 *
 * @example
 * const template = translateTemplate(
 *   slotTemplateDefinition,
 *   slotTemplateMeta,
 *   slotTemplateDefaults,
 *   'fr' // French locale
 * );
 *
 * // The template contains actual French translations extracted from defaults
 */
export function translateTemplate(
  definition: TemplateDefinition,
  meta: TemplateMeta,
  defaults: TemplateDefaults,
  locale: string = "en"
): LandingTemplate {
  // Build blocks with extracted locale data
  const blocks: TemplateBlockDefinition[] = definition.blocks.map((blockDef) => {
    const blockMeta = meta.blocks?.[blockDef.id];
    const blockDefaults = defaults.blocks?.[blockDef.id];

    // Get block label from meta (overrides KIND i18n)
    const label = getBlockLabel(blockMeta, locale);

    // Get block description from meta (overrides KIND i18n)
    const description = blockMeta?.description?.[locale] || blockMeta?.description?.en;

    // Extract locale-specific data for block
    const blockData = extractLocaleData(blockDefaults?.data, locale);

    // Build addons with extracted locale data
    const addons = blockDef.addons?.map((addonDef) => {
      const addonDefaults = blockDefaults?.addons?.[addonDef.id];

      // Extract locale-specific values from defaults
      // Handles both { title: { en: "..." } } and { showPlayButton: true }
      const defaultData = extractLocaleData(addonDefaults?.data, locale);

      return {
        id: addonDef.id,
        kind: addonDef.kind,
        mode: addonDef.mode,
        maxInstances: addonDef.maxInstances,
        hideInspector: addonDef.hideInspector,
        defaultData: Object.keys(defaultData).length > 0 ? defaultData : undefined,
      };
    });

    return {
      id: blockDef.id,
      kind: blockDef.kind,
      mode: blockDef.mode,
      maxInstances: blockDef.maxInstances,
      label,
      description,
      defaultData: Object.keys(blockData).length > 0 ? blockData : undefined,
      addons,
    };
  });

  // Get translated template meta
  const templateMeta = meta.meta
    ? {
        name: meta.meta.name[locale] || meta.meta.name.en,
        description: meta.meta.description[locale] || meta.meta.description.en,
      }
    : undefined;

  return {
    id: definition.id,
    meta: templateMeta,
    blocks,
  };
}
