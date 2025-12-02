import { z } from "zod";

import {
  LandingAddonSchema,
  createAddonByKind,
  LandingBlockAddonDefinition,
} from "@/features/landings/addons";
import {
  applyTranslationDefaults,
  type TranslationFn,
} from "../utils/translationDefaults";
import type { LandingBlockPlugin } from "./plugin";
import emptyPlugin from "./emptyBlock";
import { clone, createId } from "../utils/serialization";

const landingBlockPlugins = [
  emptyPlugin,
] as const satisfies readonly LandingBlockPlugin<any>[];

type LandingBlockPluginTuple = typeof landingBlockPlugins;

type LandingBlockPluginKind = LandingBlockPluginTuple[number]["kind"];

const landingBlockPluginMap = landingBlockPlugins.reduce(
  (acc, plugin) => {
    acc[plugin.kind] = plugin;
    return acc;
  },
  {} as Record<LandingBlockPluginKind, LandingBlockPlugin<any>>
);

const buildBlockSchema = <P extends LandingBlockPlugin<any>>(plugin: P) =>
  z.object({
    id: z.string().min(1, "Block id is required"),
    kind: z.literal(plugin.kind),
    data: plugin.schema,
    __templateFixed: z.boolean().optional(),
    __templateBlockId: z.string().optional(),
    addons: z.array(LandingAddonSchema).default([]),
  });

  const schemas = [
  buildBlockSchema(emptyPlugin),
] as const;

export const LandingBlockSchema = z.discriminatedUnion("kind", schemas);

export type LandingBlock = z.infer<typeof LandingBlockSchema>;
export type LandingBlockKind = LandingBlockPluginKind;

type PluginByKind<K extends LandingBlockKind> = Extract<LandingBlockPluginTuple[number], { kind: K }>;

const findPluginByKind = <K extends LandingBlockKind>(
  kind: K
): PluginByKind<K> | undefined =>
  landingBlockPlugins.find((plugin): plugin is PluginByKind<K> => plugin.kind === kind);

export const createBlockByKind = <K extends LandingBlockKind>(
  kind: K,
  overrides?: Partial<PluginByKind<K>["defaultData"]>,
  addonOverrides?: LandingBlockAddonDefinition[],
  translator?: TranslationFn
): LandingBlock => {
  const plugin = findPluginByKind(kind);
  if (!plugin) {
    throw new Error(`Unknown block kind: ${kind}`);
  }

  const defaultData = clone(plugin.defaultData);
  const withI18nDefaults = applyTranslationDefaults(
    defaultData,
    translator,
    "blocks.items",
    kind
  );

  return {
    id: createId(),
    kind,
    data: {
      ...withI18nDefaults,
      ...(overrides ?? {}),
    },
    addons: (addonOverrides ?? [])
      .map((slot) => {
        const addon = createAddonByKind(slot.kind, slot.defaultData, translator);

        if (slot.mode === "fixed") {    
          addon.__templateAddonId = slot.id;
          addon.__templateFixed = true;
        }

        if (slot.hideInspector) {
          addon.__inspectorHidden = true;
        }

        return addon;
      }),
  } satisfies LandingBlock;
};

export { landingBlockPlugins, landingBlockPluginMap };
