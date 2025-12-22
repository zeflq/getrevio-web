/**
 * Translation utilities for landing addons and blocks
 *
 * This module provides utilities to resolve translations from KIND i18n:
 * 1. KIND i18n (portable, in addon/block i18n.ts files)
 * 2. Locale fallback (en → requested locale)
 * 3. Fallback values
 *
 * Usage:
 * - For addon labels in AddonsCard: use resolveAddonLabel
 * - For block labels in BlockCard: use resolveBlockLabel
 * - For inspector field labels: use resolveFieldLabel
 * - For field placeholders: use resolveFieldPlaceholder
 */

// Addon utilities
export { getAddonI18n } from "./getAddonI18n";
export { resolveAddonLabel } from "./resolveAddonLabel";
export { resolveAddonDescription } from "./resolveAddonDescription";
export { resolveFieldLabel } from "./resolveFieldLabel";
export { resolveFieldPlaceholder } from "./resolveFieldPlaceholder";

// Block utilities
export { getBlockI18n } from "./getBlockI18n";
export { resolveBlockLabel } from "./resolveBlockLabel";
export { resolveBlockDescription } from "./resolveBlockDescription";

// Types
export type { AddonI18n, BlockI18n, Locale } from "./types";
