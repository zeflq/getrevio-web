/**
 * Block KIND i18n Registry
 *
 * This registry maps block kinds to their portable i18n objects.
 * Add new blocks here as they are migrated to the KIND i18n pattern.
 */

import { emptyBlockI18n } from "../../blocks/emptyBlock/i18n";
import type { BlockI18n } from "./types";

/**
 * Registry of all block KIND i18n
 * Each block should export its i18n from <block>/i18n.ts
 */
const blockI18nRegistry = {
  empty: emptyBlockI18n,
} as const;

/**
 * Get KIND i18n for a block
 *
 * @param kind - The block kind (e.g., "empty")
 * @returns The block's KIND i18n object, or undefined if not found
 *
 * @example
 * const i18n = getBlockI18n("empty");
 * console.log(i18n.label.en); // "Page"
 */
export function getBlockI18n(kind: string): BlockI18n | undefined {
  return blockI18nRegistry[kind as keyof typeof blockI18nRegistry];
}
