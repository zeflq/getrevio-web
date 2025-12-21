/**
 * Addon KIND i18n Registry
 *
 * This registry maps addon kinds to their portable i18n objects.
 * Add new addons here as they are migrated to the KIND i18n pattern.
 */

import { lotteryAddonI18n } from "../../addons/lotteryAddon/i18n";
import { simpleTitleI18n } from "../../addons/simpleTitle/i18n";
import { sloteBannerI18n } from "../../addons/sloteBanner/i18n";
import { footerAddonI18n } from "../../addons/footerAddon/i18n";
import { actionSectionAddonI18n } from "../../addons/actionSectionAddon/i18n";
import { actionsdrawerAddonI18n } from "../../addons/ActionsdrawerAddon/i18n";
import { winningDrawerAddonI18n } from "../../addons/winningDrawerAddon/i18n";
import { googleReviewActionDrawerAddonI18n } from "../../addons/googleReviewActionDrawerAddon/i18n";
import { instagramActionDrawerAddonI18n } from "../../addons/instagramActionDrawerAddon/i18n";
import type { AddonI18n } from "./types";

/**
 * Registry of all addon KIND i18n
 * Each addon should export its i18n from <addon>/i18n.ts
 */
const addonI18nRegistry = {
  lotteryAddon: lotteryAddonI18n,
  simpleTitle: simpleTitleI18n,
  sloteBanner: sloteBannerI18n,
  footerAddon: footerAddonI18n,
  actionSectionAddon: actionSectionAddonI18n,
  actionsdrawerAddon: actionsdrawerAddonI18n,
  winningDrawerAddon: winningDrawerAddonI18n,
  googleReviewActionDrawerAddon: googleReviewActionDrawerAddonI18n,
  instagramActionDrawerAddon: instagramActionDrawerAddonI18n,
} as const;

/**
 * Get KIND i18n for an addon
 *
 * @param kind - The addon kind (e.g., "lotteryAddon")
 * @returns The addon's KIND i18n object, or undefined if not found
 *
 * @example
 * const i18n = getAddonI18n("lotteryAddon");
 * console.log(i18n.label.en); // "Lottery"
 */
export function getAddonI18n(kind: string): AddonI18n | undefined {
  return addonI18nRegistry[kind as keyof typeof addonI18nRegistry];
}
