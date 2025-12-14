# Landing templates

Landing pages are composed from a list of *landing templates* that describe which blocks (and block addons) can appear together. The full template catalogue lives in `src/features/landings/templates/index.ts`, where each entry is a `LandingTemplate` (defined in `src/features/landings/templates/types.ts`). These templates drive the editor UI, the form that lets merchants choose a template, and the runtime helpers that enforce how many copies of each block/addon might exist.

## Template shape

A `LandingTemplate` is a small config object:

```ts
export type TemplateBlockDefinition = {
  id: string; // unique slot ID used to tag the block/addons with their originating slot
  kind: LandingBlockKind; // the block plugin kind (see `src/features/landings/blocks/index.ts`)
  mode: "fixed" | "optional"; // whether the editor must keep at least one instance
  maxInstances?: number; // optional cap that the UI honors when adding/duplicating blocks
  label?: string; // optional display label for this block instance (supports i18n: prefix)
  defaultData?: Record<string, unknown>; // starter payload for the block inspector
  addons?: LandingBlockAddonDefinition[]; // addon slots that sit under the block
};

export type LandingTemplate = {
  id: string;
  blocks: TemplateBlockDefinition[];
};
```

Each `kind` must match one of the `LandingBlockKind` values exported from the block registry (`src/features/landings/blocks/index.ts`). When merchants select a template, the UI surfaces a translated name and description that live under the `landings.templates.{templateId}` namespace (see `landings.form` and `landings.editor` translations used in `LandingFormFields.tsx` and `LandingContentEditor.tsx`).

The `mode` flag controls whether the template enforces a required block count: "fixed" slots contribute to the template’s fixed count map (`getTemplateFixedCountMap` in `src/features/landings/templates/utils.ts`), which keeps the delete button disabled until the minimum number of fixed blocks or addons remain. Templates also export a `maxInstances` map (`getTemplateMaxInstanceMap`) so the UI can prevent dropping below caps when duplicates are added (the same logic is mirrored for addons in `src/features/landings/editor/addons/BlockAddonsSection.tsx`).

### Block labels

Templates can specify a custom `label` for each block instance that appears in the editor UI (BlockCard). This label is stored as `__templateLabel` metadata on the block and takes precedence over the default block type label. Labels support the `i18n:` prefix for localization:

```ts
{
  id: "empty1",
  kind: "empty",
  mode: "fixed",
  maxInstances: 1,
  label: "i18n:templates.slotTemplate.defaultValues.empty1.label"
}
```

When `createBlockByKind` receives a `label`, it passes it through `applyOverrideTranslations` to resolve any `i18n:` keys before storing it as `__templateLabel`. The editor's `BlockCard` component then displays this label instead of the generic block type label, making it easier to distinguish multiple instances of the same block kind.

### Localized defaults

Blocks and addons keep their `defaultData` static, but the editor layers in translations when a field is intentionally left blank. `createBlockByKind` and `createAddonByKind` both call `applyTranslationDefaults` (`src/features/landings/utils/translationDefaults.ts`) before the data lands in the form, replacing empty strings with values sourced from `landings.editor.blocks.items.{kind}.defaults.{field}` or `landings.editor.addons.items.{kind}.defaults.{field}`. This keeps the schema pure (defaults remain in the plugin files) while still letting translators supply reasonable copy without editing TypeScript.

### Template override defaults

In addition to plugin defaults and translations, templates can provide `defaultData` overrides for block/addon slots. These overrides run through `applyOverrideTranslations` before being merged so they can either be literal fallback copy or special `i18n:{key}` markers that point directly at any translation string (for example `i18n:landings.editor.templates.slotTemplate.empty2.addons.slot-simple-title.title`). This makes it easy to seed a template with locale-aware copy without touching the addon's schema — simply point the template override at the translation key you want and the landing editor will resolve it at runtime.

### Addons inside a block

Each block definition can declare `addons`, which is an array of `LandingBlockAddonDefinition` objects from `src/features/landings/addons/index.tsx`. These addon slots behave like their own mini-templates:

- `kind` is one of the `LandingAddonKind` values exported by the addon registry (currently `footerAddon`).
- `mode` and `maxInstances` describe whether the slot is mandatory (`fixed`) and how many can exist together.
- `defaultData` seeds the inspector with sensible values.

When a block is created from a template slot, `LandingContentEditor.handleAddBlock` calls `createBlockByKind` (from `src/features/landings/blocks/index.ts`) with the template’s default data and addon definitions. The resulting block carries `__templateBlockId` and `__templateFixed` metadata so downstream UI can tell whether the block is tied to a fixed slot.

Addons are rendered and managed inside `BlockAddonsSection`. That component watches the block’s `addons` field, keeps count per addon kind, prevents adding more than the configured `maxInstances`, and respects the fixed-count guard using the same `mode`/slot definitions. When the user clicks an addon slot, `createAddonByKind` instantiates it with its plugin defaults and marks metadata like `__templateAddonId` and `__templateFixed` so duplication/deletion respects the template rules.

## Template-driven landing creation flow

1. The merchant chooses a template via the combobox inside `LandingFormFields.tsx`. The combobox options are derived from `landingTemplates.map((tpl) => ({ value: tpl.id, label: t_tpl(`${tpl.id}.name`) }))` so you must add translations for every template name/description you introduce.
2. `LandingContentEditor` reads `landing.templateId`, calls `getTemplateById`, and passes the template to `BlockList` and each `BlockCard`.
3. When a block is added, the editor uses the template block definition to fill default fields, attach addon slots, and mark the block as `__templateFixed` if `mode === "fixed"`. `BlockList` also caches the template’s max-instance and fixed maps so duplicate/delete actions stay within the configured limits.
4. Each block card renders `BlockAddonsSection`, which looks at `templateBlock?.addons` to show add buttons, enforce addon caps, and protect fixed addons from deletion.
5. Every block/addon created this way still flows through the normal `landingBlockPluginMap` / `landingAddonPluginMap`, so the inspector UI and preview use the same renderers as manually added blocks.

## Extending or debugging templates

- Add or edit entries in `landingTemplates`. Keep the `id` stable because it is stored on the landing record as `templateId`.
- Supply translations for `landings.templates.{id}.name` and `.description` to keep the UI readable.
- If you add a new block kind, update the block registry in `src/features/landings/blocks/index.ts` so `createBlockByKind` can build it.
- If you add addons, register them in `src/features/landings/addons/index.tsx`, give them sensible `defaultData`, and reference their kind inside the block’s `addons` array.
- Remember that `mode: "fixed"` makes the editor treat the slot as required, while `mode: "optional"` only adds a slot to the dropdown and lets merchants add it when needed.
- When introducing a new addon, treat it like a block: register it, add default data, and provide `landings.editor.addons.items.{kind}.defaults.{field}` translations so `applyTranslationDefaults` can surface localized text the moment it is opened in the editor.

Following this flow keeps the landing editor aware of the template shape, ensures UI limits match the template intent, and keeps blocks/addons consistent across different landing types.
