import { z } from "zod";

import type { LandingAddonPlugin } from "./plugin";
import footerAddonPlugin from "./footerAddon";

const landingAddonPlugins = [footerAddonPlugin] as const satisfies readonly LandingAddonPlugin<any>[];

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
  });
}

//const addonSchemas = landingAddonPlugins.map((plugin) => buildAddonSchema(plugin)) as const;
const addonSchemas =[
  buildAddonSchema(footerAddonPlugin)
] as const;

export const LandingAddonSchema = z.discriminatedUnion("kind", addonSchemas);
export type LandingAddon = z.infer<typeof LandingAddonSchema>;
export type LandingAddonKind = LandingAddonPluginKind;

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

type PluginByKind<K extends LandingAddonKind> = Extract<
  LandingAddonPluginTuple[number],
  { kind: K }
>;

function findAddonPluginByKind<K extends LandingAddonKind>(kind: K): PluginByKind<K> | undefined {
  return landingAddonPlugins.find((plugin): plugin is PluginByKind<K> => plugin.kind === kind);
}

export function createAddonByKind<K extends LandingAddonKind>(
  kind: K,
  overrides?: Partial<PluginByKind<K>["defaultData"]>
): LandingAddon {
  const plugin = findAddonPluginByKind(kind);
  if (!plugin) {
    throw new Error(`Unknown addon kind: ${kind}`);
  }

  return {
    id: createId(),
    kind,
    data: {
      ...clone(plugin.defaultData),
      ...(overrides ?? {}),
    },
  };
}

export type LandingBlockAddonDefinition = {
  kind: LandingAddonKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  defaultData?: Partial<LandingAddon["data"]>;
  label?: string;
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
