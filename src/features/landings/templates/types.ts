import type { LandingBlockKind } from "../blocks";
import type { LandingBlockAddonDefinition } from "@/features/landings/addons";

export type TemplateBlockDefinition = {
  id: string;
  kind: LandingBlockKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  label?: string;
  description?: string;
  defaultData?: Record<string, unknown>;
  addons?: LandingBlockAddonDefinition[];
};

export type LandingTemplate = {
  id: string;
  meta?: {
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
 * Template Meta (KIND i18n Overrides)
 * - Contains label/description to override KIND i18n
 * - Does NOT contain field data (that goes in defaults)
 * - Each field contains Record<string, string> for all languages
 */
export type TemplateMeta = {
  templateId: string;

  // Template-level metadata with actual translations
  meta: {
    name: Record<string, string>; // { en: "...", fr: "...", ar: "..." }
    description: Record<string, string>;
  };

  // Block-level meta (label/description overrides)
  blocks?: Record<
    string,
    {
      label?: Record<string, string>;
      description?: Record<string, string>;
      // Addon meta scoped to this block (optional)
      // These override the KIND i18n label/description for specific addon instances
      addons?: Record<
        string,
        {
          label?: Record<string, string>;
          description?: Record<string, string>;
        }
      >;
    }
  >;
};

/**
 * Template Defaults (Data Values with Locale Support)
 * - Default data for blocks and addons
 * - Supports BOTH:
 *   1. Locale-based values: { title: { en: "...", fr: "..." } }
 *   2. Non-i18n config: { showPlayButton: true }
 * - Can be empty if no defaults needed
 */
export type TemplateDefaults = {
  templateId: string;

  blocks?: Record<
    string,
    {
      data?: Record<string, unknown | Record<string, string>>;
      addons?: Record<
        string,
        {
          data?: Record<string, unknown | Record<string, string>>;
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
