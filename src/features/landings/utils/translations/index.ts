/**
 * Translation utilities for landing addons and blocks
 *
 * This module provides utilities to resolve translations with a smart fallback chain:
 * 1. Instance overrides (template-specific, in messages/[locale].json)
 * 2. KIND i18n (portable, in addon/block i18n.ts files)
 * 3. Fallback values
 *
 * Usage:
 * - For addon labels in AddonsCard: use resolveAddonLabel with instance context
 * - For inspector titles: use resolveInspectorTitle
 * - For inspector field labels: use resolveFieldLabel (KIND-level only, no instance override)
 * - For field placeholders: use resolveFieldPlaceholder (KIND-level only)
 */

export { getAddonI18n } from "./getAddonI18n";
export { resolveAddonLabel } from "./resolveAddonLabel";
export { resolveAddonDescription } from "./resolveAddonDescription";
export { resolveFieldLabel } from "./resolveFieldLabel";
export { resolveFieldPlaceholder } from "./resolveFieldPlaceholder";
export { resolveInspectorTitle } from "./resolveInspectorTitle";
export type { AddonI18n, Locale } from "./types";
