import type { LandingBlockKind } from "../blocks";
import type { LandingBlockAddonDefinition } from "@/features/landings/addons";

export type TemplateBlockDefinition = {
  id: string;
  kind: LandingBlockKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  label?: string;
  defaultData?: Record<string, unknown>;
  addons?: LandingBlockAddonDefinition[];
};

export type LandingTemplate = {
  id: string;
  meta: {
    name: string;
    description: string;
  };
  blocks: TemplateBlockDefinition[];
};

// ========================================
// Phase 2: Template Structure Separation Types
// ========================================

/**
 * Template Definition (Structure Only)
 * - Pure structure: blocks, addons, configuration
 * - NO i18n keys or default data
 * - NO framework dependencies
 */
export type TemplateDefinitionBlock = {
  id: string;
  kind: LandingBlockKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  addons?: TemplateDefinitionAddon[];
};

export type TemplateDefinitionAddon = {
  id: string;
  kind: string;
  mode: "fixed" | "optional";
  maxInstances?: number;
  hideInspector?: boolean;
};

export type TemplateDefinition = {
  id: string;
  blocks: TemplateDefinitionBlock[];
};

/**
 * Template i18n Map (Actual Translations - KIND Pattern)
 * - Contains actual translations in all supported languages
 * - Same pattern as addon/block i18n (portable, co-located)
 * - NO dependency on external messages files
 * - Each field contains Record<string, string> for all languages
 */
export type TemplateI18nMap = {
  templateId: string;

  // Template-level metadata with actual translations
  meta: {
    name: Record<string, string>; // { en: "...", fr: "...", ar: "..." }
    description: Record<string, string>;
  };

  // Block-level translations
  blocks: Record<
    string,
    {
      label?: Record<string, string>;
    }
  >;

  // Addon instance overrides (optional)
  // These override the KIND i18n for specific instances
  addons?: Record<
    string,
    {
      [field: string]: Record<string, string>;
    }
  >;
};

/**
 * Template Defaults (Data Values Only)
 * - Default data for blocks and addons
 * - NO i18n keys (use actual values or primitives)
 * - Can be empty if no defaults needed
 */
export type TemplateDefaults = {
  templateId: string;

  blocks?: Record<
    string,
    {
      data?: Record<string, unknown>;
      addons?: Record<
        string,
        {
          data?: Record<string, unknown>;
        }
      >;
    }
  >;
};

/**
 * Translation function type (deprecated - kept for backwards compatibility)
 * New approach uses direct i18n object references
 */
export type TranslationFn = (key: string) => string;

/**
 * Locale getter function
 * Used to get translations for a specific locale from i18n objects
 */
export type LocaleFn = () => string;
