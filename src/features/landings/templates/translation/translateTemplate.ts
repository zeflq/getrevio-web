/**
 * Template Translation Runtime (KIND Pattern)
 *
 * Combines template structure, i18n translations, and defaults at runtime
 * to produce a LandingTemplate with actual translated values.
 *
 * This function:
 * 1. Takes the pure structure definition (no i18n, no defaults)
 * 2. Takes the i18n map with actual translations (KIND pattern)
 * 3. Takes the defaults (no structure, no i18n)
 * 4. Takes the target locale
 * 5. Returns a LandingTemplate with actual translations for that locale
 *
 * The template contains actual translated text, not i18n references.
 */

import type {
  TemplateDefinition,
  TemplateI18nMap,
  TemplateDefaults,
  LandingTemplate,
  TemplateBlockDefinition,
} from "../types";

// Helper types for i18n
type BlockI18nDef = {
  label?: Record<string, string>;
};

type AddonI18nDef = {
  [field: string]: Record<string, string>;
};

/**
 * Get block label translation for locale
 * Returns the actual translated string
 */
function getBlockLabel(
  blockI18n: BlockI18nDef | undefined,
  locale: string
): string | undefined {
  if (!blockI18n?.label) return undefined;

  // Return actual translation, fallback to 'en' if locale not available
  return blockI18n.label[locale] || blockI18n.label.en;
}

/**
 * Get addon defaultData with actual translations for locale
 */
function getAddonData(
  addonI18n: AddonI18nDef | undefined,
  locale: string
): Record<string, string> | undefined {
  if (!addonI18n) return undefined;

  const data: Record<string, string> = {};

  for (const [field, translations] of Object.entries(addonI18n)) {
    // Return actual translation, fallback to 'en' if locale not available
    data[field] = translations[locale] || translations.en;
  }

  return Object.keys(data).length > 0 ? data : undefined;
}

/**
 * Translate a template from its separated parts
 *
 * @param definition - Pure structure (blocks, addons, config)
 * @param i18nMap - i18n map with actual translations
 * @param defaults - Default data values
 * @param locale - Target locale (defaults to 'en')
 * @returns LandingTemplate with actual translations for the locale
 *
 * @example
 * const template = translateTemplate(
 *   slotTemplateDefinition,
 *   slotTemplateI18n,
 *   slotTemplateDefaults,
 *   'fr' // French locale
 * );
 *
 * // The template contains actual French translations:
 * // label: "Page 1" (not "i18n:templates.slotTemplate.blocks.empty1.label")
 */
export function translateTemplate(
  definition: TemplateDefinition,
  i18nMap: TemplateI18nMap,
  defaults: TemplateDefaults,
  locale: string = "en"
): LandingTemplate {
  // Build blocks with actual translations
  const blocks: TemplateBlockDefinition[] = definition.blocks.map((blockDef) => {
    const blockI18n = i18nMap.blocks?.[blockDef.id];
    const blockDefaults = defaults.blocks?.[blockDef.id];

    // Get actual block label translation
    const label = getBlockLabel(blockI18n, locale);

    // Build addons with actual translations
    const addons = blockDef.addons?.map((addonDef) => {
      const addonI18n = i18nMap.addons?.[addonDef.id];
      const addonDefaults = blockDefaults?.addons?.[addonDef.id];

      // Determine defaultData:
      // 1. If i18n translations exist for this addon, use actual translations
      // 2. Otherwise, use defaults from defaults file
      // 3. Otherwise, no defaultData
      let defaultData: Record<string, unknown> | undefined;

      if (addonI18n) {
        // Use actual translations for the locale
        defaultData = getAddonData(addonI18n, locale);
      } else if (addonDefaults?.data) {
        // Use non-i18n defaults
        defaultData = addonDefaults.data;
      }

      return {
        id: addonDef.id,
        kind: addonDef.kind,
        mode: addonDef.mode,
        maxInstances: addonDef.maxInstances,
        hideInspector: addonDef.hideInspector,
        defaultData,
      };
    });

    return {
      id: blockDef.id,
      kind: blockDef.kind,
      mode: blockDef.mode,
      maxInstances: blockDef.maxInstances,
      label,
      defaultData: blockDefaults?.data,
      addons,
    };
  });

  // Get translated meta
  const meta = i18nMap.meta
    ? {
        name: i18nMap.meta.name[locale] || i18nMap.meta.name.en,
        description:
          i18nMap.meta.description[locale] || i18nMap.meta.description.en,
      }
    : undefined;

  return {
    id: definition.id,
    meta,
    blocks,
  };
}
