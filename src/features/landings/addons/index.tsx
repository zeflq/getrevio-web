import { z } from "zod";

import type { LandingAddonPlugin } from "./plugin";
import {
  applyOverrideTranslations,
  applyTranslationDefaults,
} from "../utils/translationDefaults";
import type { TranslationFn } from "../utils/translationDefaults";
import actionsdrawerAddonPlugin from "./actionsdrawerAddon";
import actionSectionAddonPlugin from "./actionSectionAddon";
import footerAddonPlugin from "./footerAddon";
import googleReviewActionDrawerAddonPlugin from "./googleReviewActionDrawerAddon";
import instagramActionDrawerAddonPlugin from "./instagramActionDrawerAddon";
import simpleTitleAddonPlugin from "./simpleTitle";
import { clone, createId } from "../utils/serialization";
import sloteBannerPlugin from "./sloteBanner";
import lotteryAddonPlugin from "./lotteryAddon";
import winningDrawerAddonPlugin from "./winningDrawerAddon";

const landingAddonPlugins = [
  sloteBannerPlugin,
  footerAddonPlugin,
  actionsdrawerAddonPlugin,
  actionSectionAddonPlugin,
  simpleTitleAddonPlugin,
  googleReviewActionDrawerAddonPlugin,
  instagramActionDrawerAddonPlugin,
  lotteryAddonPlugin,
  winningDrawerAddonPlugin,
] as const satisfies readonly LandingAddonPlugin<any>[];

type LandingAddonPluginTuple = typeof landingAddonPlugins;
type LandingAddonPluginKind = LandingAddonPluginTuple[number]["kind"];

const landingAddonPluginMap = landingAddonPlugins.reduce((acc, plugin) => {
  acc[plugin.kind] = plugin;
  return acc;
}, {} as Record<LandingAddonPluginKind, LandingAddonPlugin<any>>);

function buildAddonSchema<P extends LandingAddonPlugin<any>>(plugin: P) {
  return z.object({
    id: z.string().min(1).optional(),
    kind: z.literal(plugin.kind),
    data: plugin.schema,
    __templateAddonId: z.string().optional(),
    __templateFixed: z.boolean().optional(),
    __inspectorHidden: z.boolean().optional(),
  });
}

//const addonSchemas = landingAddonPlugins.map((plugin) => buildAddonSchema(plugin)) as const;
const addonSchemas =[
  buildAddonSchema(sloteBannerPlugin),
  buildAddonSchema(footerAddonPlugin),
  buildAddonSchema(actionsdrawerAddonPlugin),
  buildAddonSchema(actionSectionAddonPlugin),
  buildAddonSchema(simpleTitleAddonPlugin),
  buildAddonSchema(googleReviewActionDrawerAddonPlugin),
  buildAddonSchema(instagramActionDrawerAddonPlugin),
  buildAddonSchema(lotteryAddonPlugin),
  buildAddonSchema(winningDrawerAddonPlugin),
] as const;

export const LandingAddonSchema = z.discriminatedUnion("kind", addonSchemas);
export type LandingAddon = z.infer<typeof LandingAddonSchema>;
export type LandingAddonKind = LandingAddonPluginKind;

type PluginByKind<K extends LandingAddonKind> = Extract<
  LandingAddonPluginTuple[number],
  { kind: K }
>;

function findAddonPluginByKind<K extends LandingAddonKind>(kind: K): PluginByKind<K> | undefined {
  return landingAddonPlugins.find((plugin): plugin is PluginByKind<K> => plugin.kind === kind);
}

type PluginDefaultData<P extends LandingAddonPlugin<any>> = P extends LandingAddonPlugin<infer T>
  ? T
  : never;

export function createAddonByKind<K extends LandingAddonKind>(
  kind: K,
  overrides?: Partial<PluginDefaultData<PluginByKind<K>>>,
  translator?: TranslationFn
): LandingAddon {
  const plugin = findAddonPluginByKind(kind);
  if (!plugin) {
    throw new Error(`Unknown addon kind: ${kind}`);
  }

  const translatedOverrides = overrides
    ? applyOverrideTranslations(overrides, translator)
    : undefined;

  return {
    id: createId(),
    kind,
    data: {
      ...clone(
        applyTranslationDefaults(plugin.defaultData, translator, "addons.items", kind)
      ),
      ...(translatedOverrides ?? {}),
    },
  };
}

export type LandingBlockAddonDefinition = {
  id: string;
  kind: LandingAddonKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  hideInspector?: boolean;
  defaultData?: Partial<LandingAddon["data"]>;
};

export function renderAddons(addons?: LandingAddon[]) {
  if (!addons?.length) {
    return null;
  }
  return addons.map((addon, index) => {
    const plugin = landingAddonPluginMap[addon.kind];
    if (!plugin) {
      return null;
    }
    const Renderer = plugin.Renderer;
    return <Renderer key={addon.id ?? `${addon.kind}-${index}`} data={addon.data} />;
  });
}

export { landingAddonPlugins, landingAddonPluginMap };
