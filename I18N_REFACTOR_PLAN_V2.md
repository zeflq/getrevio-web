# Landing i18n System Refactor Plan V2

## 🎯 Core Principle: Complete Separation of Concerns

### Current Problem: Mixed Concerns

**Current template structure mixes everything**:
```typescript
export const landingTemplates: LandingTemplate[] = [
  {
    id: "slotTemplate",
    blocks: [
      {
        id: "empty1",
        kind: "empty",
        label: "i18n:templates.slotTemplate.defaultValues.empty1.label", // ❌ i18n mixed in
        addons: [
          {
            kind: "simpleTitle",
            defaultData: {
              title: "i18n:templates.slotTemplate.defaultValues.empty2.addons.slot-simple-title.title" // ❌ i18n mixed in
            }
          }
        ]
      }
    ]
  }
];
```

**Issues**:
- ❌ Template structure + i18n keys + default values all mixed
- ❌ Hard to understand what's structure vs. what's translatable
- ❌ Can't easily see all i18n keys for a template
- ❌ Difficult to maintain

---

## ✅ Proposed Architecture: 4 Separate Layers

### Layer 1: Template Structure (Pure Data)

**Responsibility**: Define WHAT blocks and addons, in WHAT order, with WHAT constraints.
**No i18n, no default values, just structure**.

```typescript
// src/features/landings/templates/definitions/slotTemplate.ts
import type { TemplateDefinition } from "../types";

export const slotTemplateDefinition: TemplateDefinition = {
  id: "slotTemplate",
  blocks: [
    {
      id: "empty1",
      kind: "empty",
      mode: "fixed",
      maxInstances: 1,
      addons: [
        {
          id: "slote-banner-section",
          kind: "sloteBanner",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true
        },
        {
          id: "action-section",
          kind: "actionSectionAddon",
          mode: "fixed",
          maxInstances: 1,
        },
        {
          id: "slot-game-footer",
          kind: "footerAddon",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true
        },
        {
          id: "slot-game-action-drawer",
          kind: "actionsdrawerAddon",
          mode: "fixed",
          maxInstances: 1,
        },
      ],
    },
    {
      id: "empty2",
      kind: "empty",
      mode: "fixed",
      maxInstances: 1,
      addons: [
        {
          id: "slot-simple-title",
          kind: "simpleTitle",
          mode: "fixed",
          maxInstances: 1,
        },
        {
          id: "slote-banner-section",
          kind: "sloteBanner",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true,
        },
        {
          id: "lottery-section",
          kind: "lotteryAddon",
          mode: "fixed",
          maxInstances: 1,
        },
        {
          id: "slot-winning-drawer",
          kind: "winningDrawerAddon",
          mode: "fixed",
          hideInspector: true,
          maxInstances: 1,
        },
      ],
    }
  ],
};
```

**Benefits**:
- ✅ Pure structure - easy to understand
- ✅ No i18n pollution
- ✅ Clear constraints (mode, maxInstances)
- ✅ Easy to modify structure without touching i18n

---

### Layer 2: Template i18n Keys (Translation Mapping)

**Responsibility**: Map template structure elements to translation keys.
**Explicit, typed, separate from structure**.

```typescript
// src/features/landings/templates/i18n/slotTemplate.i18n.ts
import type { TemplateI18nMap } from "../types";

/**
 * i18n keys for slotTemplate
 * Maps template structure to translation namespace
 */
export const slotTemplateI18n: TemplateI18nMap = {
  templateId: "slotTemplate",
  namespace: "templates.slotTemplate",

  // Template-level translations
  meta: {
    name: "name",           // → templates.slotTemplate.name
    description: "description", // → templates.slotTemplate.description
  },

  // Block-level translations
  blocks: {
    empty1: {
      label: "blocks.empty1.label", // → templates.slotTemplate.blocks.empty1.label
    },
    empty2: {
      label: "blocks.empty2.label", // → templates.slotTemplate.blocks.empty2.label
      addons: {
        "slot-simple-title": {
          title: "blocks.empty2.addons.slot-simple-title.title",
          subtitle: "blocks.empty2.addons.slot-simple-title.subtitle",
        }
      }
    }
  }
};
```

**Benefits**:
- ✅ All i18n keys in one place
- ✅ Easy to audit translations
- ✅ Type-safe with TemplateI18nMap
- ✅ Clear namespace structure

---

### Layer 3: Template Default Values (Data Overrides)

**Responsibility**: Define default data values for template instances.
**No i18n keys, just actual default values**.

```typescript
// src/features/landings/templates/defaults/slotTemplate.defaults.ts
import type { TemplateDefaults } from "../types";

/**
 * Default values for slotTemplate
 * These are applied when creating a landing from this template
 */
export const slotTemplateDefaults: TemplateDefaults = {
  templateId: "slotTemplate",

  blocks: {
    empty1: {
      data: {}, // Empty block has no data
    },
    empty2: {
      data: {}, // Empty block has no data
      addons: {
        "slote-banner-section": {
          data: {
            showPlayButton: true // ✅ Actual default value
          }
        }
      }
    }
  }
};
```

**Benefits**:
- ✅ Clear default values
- ✅ No i18n pollution
- ✅ Easy to see what's customized per template
- ✅ Type-safe

---

### Layer 4: Runtime Translation Resolution

**Responsibility**: Combine structure + i18n keys + defaults + translator → final data.
**Happens at creation time (createLandingFromTemplate)**.

```typescript
// src/features/landings/templates/createFromTemplate.ts
import { translateTemplate } from "./translation/translateTemplate";
import { slotTemplateDefinition } from "./definitions/slotTemplate";
import { slotTemplateI18n } from "./i18n/slotTemplate.i18n";
import { slotTemplateDefaults } from "./defaults/slotTemplate.defaults";
import type { TranslationFn } from "../utils/translations/types";

export function createLandingFromTemplate(
  templateId: string,
  translator: TranslationFn
) {
  // 1. Get structure
  const structure = getTemplateDefinition(templateId); // e.g., slotTemplateDefinition

  // 2. Get i18n mapping
  const i18nMap = getTemplateI18n(templateId); // e.g., slotTemplateI18n

  // 3. Get defaults
  const defaults = getTemplateDefaults(templateId); // e.g., slotTemplateDefaults

  // 4. Translate and combine
  return translateTemplate(structure, i18nMap, defaults, translator);
}
```

**Translation logic**:
```typescript
// src/features/landings/templates/translation/translateTemplate.ts
export function translateTemplate(
  structure: TemplateDefinition,
  i18nMap: TemplateI18nMap,
  defaults: TemplateDefaults,
  translator: TranslationFn
): LandingContent {
  const blocks = structure.blocks.map((blockDef) => {
    const blockI18n = i18nMap.blocks[blockDef.id];
    const blockDefaults = defaults.blocks[blockDef.id];

    // Translate block label
    const label = blockI18n?.label
      ? translator(`${i18nMap.namespace}.${blockI18n.label}`)
      : undefined;

    // Create block with translated defaults
    const block = createBlockByKind(
      blockDef.kind,
      blockDefaults?.data,
      blockDef.addons, // Will translate addons recursively
      label,
      translator,
      i18nMap,
      defaults
    );

    return block;
  });

  return { blocks };
}
```

**Benefits**:
- ✅ Clear translation flow
- ✅ Structure + i18n + defaults combined at runtime
- ✅ Single source of truth for each concern
- ✅ Easy to test each layer independently

---

## 📊 Comparison: Before vs. After

### Before (Mixed Concerns)

```typescript
// Everything in one place ❌
{
  id: "empty2",
  kind: "empty",
  label: "i18n:templates.slotTemplate.defaultValues.empty2.label", // i18n
  addons: [
    {
      kind: "simpleTitle",
      defaultData: {
        title: "i18n:templates.slotTemplate.defaultValues.empty2.addons.slot-simple-title.title", // i18n
        subtitle: "i18n:templates.slotTemplate.defaultValues.empty2.addons.slot-simple-title.subtitle" // i18n
      }
    }
  ]
}
```

### After (Separated Concerns)

**Structure** (definitions/slotTemplate.ts):
```typescript
{
  id: "empty2",
  kind: "empty",
  mode: "fixed",
  addons: [
    {
      id: "slot-simple-title",
      kind: "simpleTitle",
      mode: "fixed",
    }
  ]
}
```

**i18n** (i18n/slotTemplate.i18n.ts):
```typescript
blocks: {
  empty2: {
    label: "blocks.empty2.label",
    addons: {
      "slot-simple-title": {
        title: "blocks.empty2.addons.slot-simple-title.title",
        subtitle: "blocks.empty2.addons.slot-simple-title.subtitle"
      }
    }
  }
}
```

**Defaults** (defaults/slotTemplate.defaults.ts):
```typescript
blocks: {
  empty2: {
    addons: {
      "slot-simple-title": {
        data: {
          // Could add default values here if needed
          // For now, use plugin defaults
        }
      }
    }
  }
}
```

---

## 🗂️ File Organization

```
src/features/landings/templates/
├── types.ts                           # TypeScript types
│
├── definitions/                       # Layer 1: Structure
│   ├── slotTemplate.ts
│   └── index.ts
│
├── i18n/                             # Layer 2: Translation keys
│   ├── slotTemplate.i18n.ts
│   └── index.ts
│
├── defaults/                         # Layer 3: Default values
│   ├── slotTemplate.defaults.ts
│   └── index.ts
│
├── translation/                      # Layer 4: Translation logic
│   ├── translateTemplate.ts
│   └── types.ts
│
├── createFromTemplate.ts             # Public API
└── index.ts                          # Exports
```

---

## 🎯 Answering Your Questions

### Q1: Will you separate render/inspector/defaultvalue/(addon list/block list/template list) from i18n?

**Yes! Complete separation**:

| Component | i18n Location | How |
|-----------|--------------|-----|
| **Renderer** | Shared package | ❌ No i18n - receives pre-translated strings as props |
| **Inspector** | Web app | ✅ Uses `useTranslations` (has NextIntlClientProvider) |
| **Default Values** | `templates/defaults/` | ❌ No i18n - pure data values |
| **Addon List** | Web app component | ✅ Pre-translates labels: `t('addons.items.${kind}.label')` |
| **Block List** | Web app component | ✅ Pre-translates labels: `t('blocks.items.${kind}.label')` |
| **Template List** | Web app component | ✅ Pre-translates labels: `t('templates.${id}.name')` |

**Pattern**:
- Shared package: No i18n dependencies
- Web app: All i18n happens here, pre-translates everything

---

### Q2: Should templates explicitly include i18n and default values, or is that overkill?

**Answer: Separate them (not overkill, essential for maintainability)**

**3 separate files per template** (recommended):

1. **Definition** (`definitions/slotTemplate.ts`):
   - Structure only
   - No i18n, no defaults
   - Easy to understand template layout

2. **i18n Map** (`i18n/slotTemplate.i18n.ts`):
   - All translation keys in one place
   - Easy to audit what's translatable
   - Type-safe with TemplateI18nMap

3. **Defaults** (`defaults/slotTemplate.defaults.ts`):
   - Default data values
   - No i18n keys, just actual values
   - Easy to see what's customized

**Why not overkill**:
- ✅ Each file has single responsibility
- ✅ Easy to understand each concern
- ✅ Easy to modify without breaking others
- ✅ Easy to test each layer
- ✅ Clear separation for new developers

**Alternative (NOT recommended)**:
Keeping everything in one file is simpler initially but becomes unmaintainable as templates grow.

---

## 🔄 Migration Path

### Phase 1: Renderers (Fix Immediate Error)

**Goal**: Remove `useTranslations` from shared package renderers.

**Files**:
1. `packages/landing/src/addons/ui/socialActionDrawer/types.ts` - NEW (translation contract)
2. `packages/landing/src/addons/ui/socialActionDrawer/SocialActionDrawerRenderer.tsx` - Update to accept `translations` prop
3. `src/features/landings/utils/translations/resolveSocialActionDrawerTranslations.ts` - NEW
4. `src/features/landings/addons/googleReviewActionDrawerAddon/Renderer.tsx` - Wrapper
5. `src/features/landings/addons/instagramActionDrawerAddon/Renderer.tsx` - Wrapper

**Result**: ✅ No more context error

---

### Phase 2: Template Structure Separation

**Goal**: Separate template definitions, i18n, and defaults.

**New structure**:
```
templates/
├── definitions/
│   └── slotTemplate.ts        # Structure only
├── i18n/
│   └── slotTemplate.i18n.ts   # i18n keys
├── defaults/
│   └── slotTemplate.defaults.ts # Default values
└── translation/
    └── translateTemplate.ts    # Combines all layers
```

**Migration**:
1. Extract structure from current templates → `definitions/`
2. Extract i18n keys → `i18n/`
3. Extract default values → `defaults/`
4. Create `translateTemplate` function
5. Update `createLandingFromTemplate` to use new structure

**Result**: ✅ Clear separation of concerns

---

### Phase 3: Simplify Translation Functions

**Goal**: Replace complex `applyTranslationDefaults`/`applyOverrideTranslations`.

**New functions**:
```typescript
// Simple, explicit translation
translateDefaults(pluginDefaults, translator, namespace, kind)
applyOverrides(base, overrides, translator)
```

**Result**: ✅ Simpler, more maintainable

---

## 📝 Type Definitions

```typescript
// src/features/landings/templates/types.ts

/**
 * Template structure definition (no i18n, no defaults)
 */
export interface TemplateDefinition {
  id: string;
  blocks: TemplateBlockDefinition[];
}

export interface TemplateBlockDefinition {
  id: string;
  kind: LandingBlockKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  addons: TemplateAddonDefinition[];
}

export interface TemplateAddonDefinition {
  id: string;
  kind: LandingAddonKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  hideInspector?: boolean;
}

/**
 * Template i18n mapping
 */
export interface TemplateI18nMap {
  templateId: string;
  namespace: string; // e.g., "templates.slotTemplate"

  meta: {
    name: string;           // Relative key: "name"
    description?: string;   // Relative key: "description"
  };

  blocks: Record<string, BlockI18nMap>;
}

export interface BlockI18nMap {
  label?: string; // Relative key
  addons?: Record<string, AddonI18nMap>;
}

export interface AddonI18nMap {
  [key: string]: string; // Addon-specific i18n keys
}

/**
 * Template default values
 */
export interface TemplateDefaults {
  templateId: string;

  blocks: Record<string, BlockDefaults>;
}

export interface BlockDefaults {
  data?: Record<string, unknown>;
  addons?: Record<string, AddonDefaults>;
}

export interface AddonDefaults {
  data?: Record<string, unknown>;
}
```

---

## ✅ Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Renderer i18n** | ❌ useTranslations in shared pkg | ✅ Pre-translated props |
| **Template structure** | ❌ Mixed with i18n and defaults | ✅ Separate definition file |
| **i18n keys** | ❌ Scattered in template | ✅ Dedicated i18n file |
| **Default values** | ❌ Mixed with i18n | ✅ Dedicated defaults file |
| **Maintainability** | ❌ Hard to understand | ✅ Clear separation |
| **Testability** | ❌ Complex | ✅ Each layer testable |
| **Type safety** | ❌ Partial | ✅ Full type safety |

---

## 🧪 Testing Strategy

### Layer 1: Structure Tests
```typescript
describe("slotTemplateDefinition", () => {
  it("should have correct structure", () => {
    expect(slotTemplateDefinition.id).toBe("slotTemplate");
    expect(slotTemplateDefinition.blocks).toHaveLength(2);
    expect(slotTemplateDefinition.blocks[0].kind).toBe("empty");
  });
});
```

### Layer 2: i18n Map Tests
```typescript
describe("slotTemplateI18n", () => {
  it("should map all blocks to i18n keys", () => {
    expect(slotTemplateI18n.blocks.empty1.label).toBe("blocks.empty1.label");
    expect(slotTemplateI18n.namespace).toBe("templates.slotTemplate");
  });
});
```

### Layer 3: Defaults Tests
```typescript
describe("slotTemplateDefaults", () => {
  it("should have showPlayButton true for banner", () => {
    expect(slotTemplateDefaults.blocks.empty2.addons["slote-banner-section"].data.showPlayButton).toBe(true);
  });
});
```

### Layer 4: Translation Tests
```typescript
describe("translateTemplate", () => {
  it("should combine structure + i18n + defaults", () => {
    const mockTranslator = (key: string) => `TRANSLATED:${key}`;

    const result = translateTemplate(
      slotTemplateDefinition,
      slotTemplateI18n,
      slotTemplateDefaults,
      mockTranslator
    );

    expect(result.blocks[0].__templateLabel).toBe("TRANSLATED:templates.slotTemplate.blocks.empty1.label");
  });
});
```

---

## 🎉 Conclusion

**Your instinct is correct**: We should completely separate concerns!

**4 layers**:
1. **Structure** - What blocks/addons, in what order
2. **i18n** - Translation key mappings
3. **Defaults** - Actual default values
4. **Translation** - Runtime combination

**Not overkill** - each layer has clear responsibility, making the system:
- ✅ Easier to understand
- ✅ Easier to maintain
- ✅ Easier to test
- ✅ More flexible

The extra files are worth it for long-term maintainability.
