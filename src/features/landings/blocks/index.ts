import { z } from "zod";

import {
  LandingAddonSchema,
  createAddonByKind,
  LandingBlockAddonDefinition,
} from "@/features/landings/addons";
import type { LandingBlockPlugin } from "./plugin";
import simpleHeroPlugin from "./simpleHero";
import heroWithCtaPlugin from "./heroWithCta";
import legalTextPlugin from "./legalText";
import gamePlugin from "./game";
import intentHeroPlugin from "./intentHero";

//const landingBlockPlugins = [simpleHeroPlugin, heroWithCtaPlugin, legalTextPlugin, gamePlugin] as const;
const landingBlockPlugins = [
  simpleHeroPlugin,
  heroWithCtaPlugin,
  legalTextPlugin,
  gamePlugin,
  intentHeroPlugin,
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
  buildBlockSchema(simpleHeroPlugin),
  buildBlockSchema(heroWithCtaPlugin),
  buildBlockSchema(legalTextPlugin),
  buildBlockSchema(gamePlugin),
  buildBlockSchema(intentHeroPlugin),
] as const;

export const LandingBlockSchema = z.discriminatedUnion("kind", schemas);

export type LandingBlock = z.infer<typeof LandingBlockSchema>;
export type LandingBlockKind = LandingBlockPluginKind;

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

type PluginByKind<K extends LandingBlockKind> = Extract<LandingBlockPluginTuple[number], { kind: K }>;

const findPluginByKind = <K extends LandingBlockKind>(
  kind: K
): PluginByKind<K> | undefined =>
  landingBlockPlugins.find((plugin): plugin is PluginByKind<K> => plugin.kind === kind);

export const createBlockByKind = <K extends LandingBlockKind>(
  kind: K,
  overrides?: Partial<PluginByKind<K>["defaultData"]>,
  addonOverrides?: LandingBlockAddonDefinition[]
): LandingBlock => {
  const plugin = findPluginByKind(kind);
  if (!plugin) {
    throw new Error(`Unknown block kind: ${kind}`);
  }

  return {
    id: createId(),
    kind,
    data: {
      ...clone(plugin.defaultData),
      ...(overrides ?? {}),
    },
    addons: (addonOverrides ?? [])
      .filter((slot) => slot.mode === "fixed")
      .map((slot) => createAddonByKind(slot.kind, slot.defaultData)),
  } satisfies LandingBlock;
};

export { landingBlockPlugins, landingBlockPluginMap };
