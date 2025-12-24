# Landing i18n and Default Data System

**Version:** 1.0
**Last Updated:** 2025-12-23

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Three-Layer Template Structure](#2-three-layer-template-structure)
3. [Definition Layer](#3-definition-layer-pure-structure)
4. [Meta Layer](#4-meta-layer-kind-i18n-overrides)
5. [Defaults Layer](#5-defaults-layer-locale-based-field-data)
6. [KIND i18n System](#6-kind-i18n-system-blocks-and-addons)
7. [Translation Resolution](#7-translation-resolution-system)
8. [Override Hierarchy](#8-order-of-precedence-override-hierarchy)
9. [Field Label Resolution](#9-field-label-resolution-inspector)
10. [Block/Addon Label Resolution](#10-blockaddon-label-resolution-ui-display)
11. [Data Flow Example](#11-complete-data-flow-example)
12. [File Structure Reference](#12-file-structure-summary)

---

## 1. Architecture Overview

The landing i18n system uses a **three-part separated architecture** for maximum flexibility and reusability:

```
TEMPLATES (Separated into 3 files)
    ↓
├─ Definition:  Pure structure (blocks, addons, config)
├─ Meta:        Label/description overrides for KIND i18n
└─ Defaults:    Field data with locale support
    ↓
TRANSLATION FUNCTION (Runtime combination)
    ↓
RENDERED TEMPLATE (Actual translations for target locale)
```

### Key Benefits

- **Separation of Concerns**: Structure, metadata, and data are isolated
- **Reusability**: KIND i18n is shared across templates
- **Flexibility**: Templates can override defaults per block/addon
- **Localization**: Runtime extraction of locale-specific values
- **Testability**: Each layer can be tested independently

---

## 2. Three-Layer Template Structure

### File Organization

Each template is split into **three separate files**:

```
src/features/landings/templates/
├─ definitions/
│  └─ slotTemplate.ts          # 1. Pure structure
├─ meta/
│  └─ slotTemplate.meta.ts      # 2. KIND i18n overrides
└─ defaults/
   └─ slotTemplate.defaults.ts  # 3. Locale-based data
```

### Why Separate Files?

| Layer | Purpose | Contains | Reusability |
|-------|---------|----------|-------------|
| **Definition** | Structure | Block/addon layout, modes, config | High - structure is locale-agnostic |
| **Meta** | i18n Overrides | Template-specific labels/descriptions | Medium - template-specific context |
| **Defaults** | Data Values | Field values with locale support | Low - template-specific data |

---

## 3. Definition Layer (Pure Structure)

**Location:** `templates/definitions/slotTemplate.ts`
**Type:** `TemplateDefinition`

### Purpose

Defines **ONLY** the structural layout of blocks and addons. No i18n, no data values.

### Structure

```typescript
export const slotTemplateDefinition: TemplateDefinition = {
  id: "slotTemplate",

  blocks: [
    {
      id: "empty1",                    // Unique instance ID
      kind: "empty",                   // Block type
      mode: "fixed",                   // "fixed" | "optional"
      maxInstances: 1,                 // Max allowed instances

      addons: [
        {
          id: "slote-banner-section",
          kind: "sloteBanner",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true,         // Optional: hide from UI
        },
        {
          id: "action-section",
          kind: "actionSectionAddon",
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
          id: "slot-game-footer",
          kind: "footerAddon",
          mode: "fixed",
          maxInstances: 1,
        },
      ],
    },
  ],
};
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for this block/addon instance in template |
| `kind` | `string` | Block/addon type (e.g., "empty", "actionSectionAddon") |
| `mode` | `"fixed" \| "optional"` | Fixed: always included; Optional: user can add |
| `maxInstances` | `number` | Maximum number of instances allowed |
| `hideInspector` | `boolean?` | Optional: hide from inspector panel (default: false) |

---

## 4. Meta Layer (KIND i18n Overrides)

**Location:** `templates/meta/slotTemplate.meta.ts`
**Type:** `TemplateMeta`

### Purpose

Override **KIND i18n** labels/descriptions for template-specific context.

### Type Definition

```typescript
type TemplateMeta = {
  templateId: string;

  // Template-level metadata
  meta: {
    name: Record<string, string>;        // { en: "...", fr: "...", ar: "..." }
    description: Record<string, string>;
  };

  // Block-level overrides
  blocks?: Record<string, {
    label?: Record<string, string>;
    description?: Record<string, string>;

    // Addon-level overrides
    addons?: Record<string, {
      label?: Record<string, string>;
      description?: Record<string, string>;
    }>;
  }>;
};
```

### Example

```typescript
export const slotTemplateMeta: TemplateMeta = {
  templateId: "slotTemplate",

  meta: {
    name: {
      en: "Slot Game Reloaded",
      fr: "Slot Game Reloaded",
      ar: "لعبة السلوت المعاد تحميلها",
    },
    description: {
      en: "A template optimized for slot game landings",
      fr: "Un modèle optimisé pour les landings de jeux de slot",
    },
  },

  blocks: {
    empty1: {
      label: {
        en: "Page 1",
        fr: "Page 1",
        ar: "صفحة 1",
      },
      description: {
        en: "First page of the slot game landing",
        fr: "Première page de la landing de jeu de slot",
      },
    },
    empty2: {
      label: {
        en: "Page 2",
        fr: "Page 2",
        ar: "صفحة 2",
      },
    },
  },
};
```

### Override Chain

```
Template Meta (highest priority)
    ↓
KIND i18n (fallback)
    ↓
Field name (ultimate fallback)
```

**Template meta** provides template-specific context, while **KIND i18n** is portable and reused across templates.

---

## 5. Defaults Layer (Locale-Based Field Data)

**Location:** `templates/defaults/slotTemplate.defaults.ts`
**Type:** `TemplateDefaults`

### Purpose

Provide **default values** for block/addon fields with **locale support**.

### Type Definition

```typescript
type TemplateDefaults = {
  templateId: string;

  blocks?: Record<string, {
    data?: Record<string, unknown | Record<string, string>>;

    addons?: Record<string, {
      data?: Record<string, unknown | Record<string, string>>;
    }>;
  }>;
};
```

### Supported Value Patterns

The system supports **two patterns** for field values:

#### 1. Locale-Based Values (i18n)

For text fields that need translation:

```typescript
title: {
  en: "Spin to reveal your gift",
  fr: "Plongez dans l'univers des slots",
  ar: "اكتشف هديتك",
}
```

#### 2. Primitive Values (Non-i18n Config)

For configuration values (booleans, numbers, enums):

```typescript
showPlayButton: true
maxAttempts: 3
variant: "primary"
```

### Example

```typescript
export const slotTemplateDefaults: TemplateDefaults = {
  templateId: "slotTemplate",

  blocks: {
    empty1: {
      data: {},  // Block has no data fields

      addons: {
        "action-section": {
          data: {
            // Locale-based text fields
            title: {
              en: "Spin to reveal your gift",
              fr: "Plongez dans l'univers des slots",
            },
            subtitle: {
              en: "Test your luck and win amazing prizes",
              fr: "Faites tourner les rouleaux pour gagner",
            },
            buttonText: {
              en: "Play Now",
              fr: "Jouer Maintenant",
            },

            // Primitive config values
            showButton: true,
            variant: "gradient",
          },
        },
        "slot-game-footer": {
          data: {
            text: {
              en: "© 2026 GetRevio. All rights reserved.",
              fr: "© 2026 GetRevio. Tous droits réservés.",
            },
            showSocialLinks: false,
          },
        },
      },
    },
    empty2: {
      data: {},
      addons: {
        "slote-banner-section": {
          data: {
            showPlayButton: true,
            autoPlay: false,
          },
        },
      },
    },
  },
};
```

---

## 6. KIND i18n System (Blocks and Addons)

**Portable translations** for block/addon types, reused across all templates.

### Block KIND i18n

**Location:** `blocks/emptyBlock/i18n.ts`

```typescript
export const emptyBlockI18n = {
  kind: "empty",

  label: {
    en: "Page",
    fr: "Page",
    ar: "صفحة",
  },

  description: {
    en: "An empty container block",
    fr: "Un bloc conteneur vide",
    ar: "كتلة حاوية فارغة",
  },
} as const;
```

**Registry:** `utils/translations/getBlockI18n.ts`

```typescript
const blockI18nRegistry = {
  empty: emptyBlockI18n,
  // ... other blocks
} as const;

export function getBlockI18n(kind: string) {
  return blockI18nRegistry[kind as keyof typeof blockI18nRegistry];
}
```

### Addon KIND i18n

**Location:** `addons/lotteryAddon/i18n.ts`

```typescript
export const lotteryAddonI18n = {
  kind: "lotteryAddon",

  label: {
    en: "Lottery",
    fr: "Loterie",
    ar: "اليانصيب",
  },

  description: {
    en: "Embed a lottery game in your landing",
    fr: "Ajoutez un jeu de loterie dans votre landing",
    ar: "أضف لعبة يانصيب إلى صفحتك",
  },

  inspector: {
    title: {
      en: "Lottery Settings",
      fr: "Paramètres de loterie",
      ar: "إعدادات اليانصيب",
    },

    fields: {
      lotteryId: {
        label: {
          en: "Lottery",
          fr: "Loterie",
          ar: "اليانصيب",
        },
        placeholder: {
          en: "Select a lottery",
          fr: "Sélectionnez une loterie",
          ar: "اختر يانصيب",
        },
      },
      contactMethod: {
        label: {
          en: "Contact Method",
          fr: "Méthode de contact",
          ar: "طريقة الاتصال",
        },
        placeholder: {
          en: "Select contact method",
          fr: "Sélectionnez une méthode",
          ar: "اختر طريقة",
        },
      },
    },
  },
} as const;
```

**Registry:** `utils/translations/getAddonI18n.ts`

```typescript
const addonI18nRegistry = {
  lotteryAddon: lotteryAddonI18n,
  actionSectionAddon: actionSectionAddonI18n,
  sloteBanner: sloteBannerI18n,
  // ... all addons
} as const;

export function getAddonI18n(kind: string) {
  return addonI18nRegistry[kind as keyof typeof addonI18nRegistry];
}
```

---

## 7. Translation Resolution System

### Runtime Function

**Location:** `templates/translation/translateTemplate.ts`

**Signature:**
```typescript
export function translateTemplate(
  definition: TemplateDefinition,
  meta: TemplateMeta,
  defaults: TemplateDefaults,
  locale: string = "en"
): LandingTemplate
```

### Process Flow

```
1. Get template metadata from meta (name, description)
    ↓
2. For each block in definition:
    ↓
3. Extract block label from meta (or fallback to KIND i18n)
    ↓
4. Extract block data from defaults for locale
    ↓
5. For each addon in block:
    ↓
6. Extract addon label from meta (or fallback to KIND i18n)
    ↓
7. Extract addon data from defaults for locale
    ↓
8. Build final LandingTemplate with actual translations
```

### Key Functions

#### 1. Extract Block Label

```typescript
function getBlockLabel(
  blockMeta: TemplateMeta["blocks"][string],
  locale: string
): string {
  // 1. Try template meta for this locale
  if (blockMeta?.label?.[locale]) {
    return blockMeta.label[locale];
  }

  // 2. Fallback to English
  if (locale !== "en" && blockMeta?.label?.en) {
    return blockMeta.label.en;
  }

  // 3. Return empty string (will fallback to KIND i18n)
  return "";
}
```

#### 2. Extract Locale Data

```typescript
function extractLocaleData<T extends Record<string, unknown>>(
  data: T | undefined,
  locale: string
): Record<string, unknown> {
  if (!data) return {};

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // If value is locale object { en: "...", fr: "..." }
    if (isLocaleObject(value)) {
      // Extract value for current locale (fallback to 'en')
      result[key] = value[locale] ?? value.en ?? "";
    } else {
      // Keep primitive value as-is
      result[key] = value;
    }
  }

  return result;
}

function isLocaleObject(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("en" in value || "fr" in value || "ar" in value)
  );
}
```

### Output Structure

```typescript
{
  id: "slotTemplate",
  meta: {
    name: "Slot Game Reloaded",      // From meta[locale]
    description: "A template...",     // From meta[locale]
  },
  blocks: [
    {
      id: "empty1",
      kind: "empty",
      mode: "fixed",
      label: "Page 1",                // From meta (overrides KIND i18n)
      description: "First page...",   // From meta
      defaultData: {},
      addons: [
        {
          id: "action-section",
          kind: "actionSectionAddon",
          mode: "fixed",
          label: "Action Section",    // From meta or KIND i18n
          defaultData: {
            title: "Spin to reveal...",        // Extracted from defaults[locale]
            subtitle: "Test your luck...",     // Extracted from defaults[locale]
            buttonText: "Play Now",            // Extracted from defaults[locale]
            showButton: true,                  // Primitive value kept as-is
            variant: "gradient",               // Primitive value kept as-is
          },
        },
      ],
    },
  ],
}
```

---

## 8. Order of Precedence (Override Hierarchy)

### For Labels and Descriptions

```
1. Template Meta (HIGHEST PRIORITY)
   └─ Defined in: slotTemplate.meta.ts
   └─ Context: Template-specific labels
   └─ Overrides: KIND i18n

2. KIND i18n (FALLBACK)
   └─ Defined in: blocks/*/i18n.ts, addons/*/i18n.ts
   └─ Context: Portable, reused across templates
   └─ Overrides: Field name

3. Field Name (ULTIMATE FALLBACK)
   └─ Example: "lotteryId" if no translations found
   └─ Context: Development/debugging
```

### For Field Data Values

```
1. Template Defaults (HIGHEST PRIORITY)
   └─ Defined in: slotTemplate.defaults.ts
   └─ Supports: Locale-based { en: "...", fr: "..." }
              AND primitives { showButton: true }
   └─ Overrides: Addon default data

2. Addon Default Data (FALLBACK)
   └─ Defined in: addons/*/schema.ts (plugin.defaultData)
   └─ Context: Addon-level defaults
   └─ Overrides: Zod schema defaults

3. Zod Schema Default (ULTIMATE FALLBACK)
   └─ Example: z.boolean().default(false)
   └─ Context: Type-level defaults
```

### Visual Override Flow

```
Template Creation Flow:
    ↓
User selects template "slotTemplate" in French
    ↓
translateTemplate(..., "fr")
    ↓
Block "empty1":
  - Label: template.meta.blocks.empty1.label.fr → "Page 1"
  - (If not found) → emptyBlockI18n.label.fr → "Page"
  - (If not found) → "empty1"
    ↓
Addon "action-section":
  - Label: template.meta.blocks.empty1.addons["action-section"].label.fr
  - (If not found) → actionSectionAddonI18n.label.fr → "Section d'action"

  - Data.title: template.defaults.blocks.empty1.addons["action-section"].data.title.fr
              → "Plongez dans l'univers des slots"
  - (If not found) → actionSectionAddonPlugin.defaultData.title → ""

  - Data.showButton: template.defaults...data.showButton → true
  - (If not found) → actionSectionAddonPlugin.defaultData.showButton → false
```

---

## 9. Field Label Resolution (Inspector)

**Location:** `utils/translations/resolveFieldLabel.ts`

### Purpose

Get field labels from **KIND i18n** for use in inspector panels.

### Function

```typescript
export function resolveFieldLabel(
  kind: string,
  fieldName: string,
  locale: Locale = "en"
): string {
  const kindI18n = getAddonI18n(kind);

  // 1. Try KIND i18n for current locale
  const fieldI18n = kindI18n?.inspector?.fields?.[fieldName];
  if (fieldI18n?.label?.[locale]) {
    return fieldI18n.label[locale];
  }

  // 2. Fallback to English
  if (locale !== "en" && fieldI18n?.label?.en) {
    return fieldI18n.label.en;
  }

  // 3. Ultimate fallback: field name itself
  return fieldName;
}
```

### Usage Example

```typescript
// In Inspector component
const locale = useLocale() as Locale;

const titleLabel = resolveFieldLabel(
  "actionSectionAddon",
  "title",
  locale
);
// French: "Titre"
// English: "Title"
// Fallback: "title"

<RHFInput
  name={`${fieldName}.title`}
  label={titleLabel}
  // ...
/>
```

### Similarly: resolveFieldPlaceholder

```typescript
export function resolveFieldPlaceholder(
  kind: string,
  fieldName: string,
  locale: Locale = "en"
): string {
  const kindI18n = getAddonI18n(kind);
  const fieldI18n = kindI18n?.inspector?.fields?.[fieldName];

  if (fieldI18n?.placeholder?.[locale]) {
    return fieldI18n.placeholder[locale];
  }

  if (locale !== "en" && fieldI18n?.placeholder?.en) {
    return fieldI18n.placeholder.en;
  }

  return "";
}
```

---

## 10. Block/Addon Label Resolution (UI Display)

### Block Labels

**Location:** `utils/translations/resolveBlockLabel.ts`

```typescript
export function resolveBlockLabel(
  kind: string,
  locale: Locale = "en"
): string {
  const kindI18n = getBlockI18n(kind);

  // 1. Try KIND i18n for current locale
  if (kindI18n?.label?.[locale]) {
    return kindI18n.label[locale];
  }

  // 2. Fallback to English
  if (locale !== "en" && kindI18n?.label?.en) {
    return kindI18n.label.en;
  }

  // 3. Ultimate fallback: kind itself
  return kind;
}
```

### Addon Labels

**Location:** `utils/translations/resolveAddonLabel.ts`

Similar pattern but uses `getAddonI18n()`:

```typescript
export function resolveAddonLabel(
  kind: string,
  locale: Locale = "en"
): string {
  const kindI18n = getAddonI18n(kind);

  if (kindI18n?.label?.[locale]) {
    return kindI18n.label[locale];
  }

  if (locale !== "en" && kindI18n?.label?.en) {
    return kindI18n.label.en;
  }

  return kind;
}
```

### Usage in UI

```typescript
// In BlockCard component
const blockLabel = resolveBlockLabel(block.kind, locale);

<Card>
  <CardTitle>{block.label || blockLabel}</CardTitle>
  {/* block.label = from template meta (if provided)
      blockLabel = from KIND i18n (fallback) */}
</Card>
```

---

## 11. Complete Data Flow Example

### Scenario: Load `slotTemplate` in French Locale

```
Step 1: User opens landing editor
    ↓
Step 2: Editor detects locale from next-intl
    → locale = "fr"
    ↓
Step 3: Call getTemplateByIdForLocale("slotTemplate", "fr")
    ↓
Step 4: translateTemplate(
         slotTemplateDefinition,
         slotTemplateMeta,
         slotTemplateDefaults,
         "fr"
        )
    ↓
Step 5: For block "empty1":
    ├─ Extract label from meta.blocks.empty1.label.fr
    │  → "Page 1"
    │
    ├─ Extract data from defaults.blocks.empty1.data
    │  → {} (no block data)
    │
    └─ For addon "action-section":
        ├─ Extract label from meta.blocks.empty1.addons["action-section"].label.fr
        │  → Not defined, fallback to KIND i18n
        │  → actionSectionAddonI18n.label.fr
        │  → "Section d'action"
        │
        └─ Extract data from defaults.blocks.empty1.addons["action-section"].data
            ├─ title: { en: "...", fr: "Plongez..." }
            │  → Extract [fr] → "Plongez dans l'univers des slots"
            │
            ├─ subtitle: { en: "...", fr: "Faites tourner..." }
            │  → Extract [fr] → "Faites tourner les rouleaux"
            │
            └─ showButton: true
               → Keep primitive as-is → true
    ↓
Step 6: Return LandingTemplate with:
    ├─ Template name: "Slot Game Reloaded"
    ├─ Block labels: "Page 1", "Page 2" (from meta, French)
    └─ Addon default data: Actual French text values
    ↓
Step 7: Editor renders template with French translations
    ↓
Step 8: User can edit blocks/addons with pre-filled French content
```

---

## 12. File Structure Summary

```
src/features/landings/

📁 templates/
├─ 📁 definitions/
│  └─ 📄 slotTemplate.ts
│     Type: TemplateDefinition
│     Contains: Structure only (blocks, addons, modes, config)
│     Exported: slotTemplateDefinition
│
├─ 📁 meta/
│  └─ 📄 slotTemplate.meta.ts
│     Type: TemplateMeta
│     Contains: Label/description overrides for KIND i18n
│     Exported: slotTemplateMeta
│
├─ 📁 defaults/
│  └─ 📄 slotTemplate.defaults.ts
│     Type: TemplateDefaults
│     Contains: Field data with locale support
│     Exported: slotTemplateDefaults
│
├─ 📁 translation/
│  └─ 📄 translateTemplate.ts
│     Function: Combines definition + meta + defaults → LandingTemplate
│     Exported: translateTemplate()
│
├─ 📄 types.ts
│  Contains: TemplateDefinition, TemplateMeta, TemplateDefaults,
│            LandingTemplate, BlockDefinition, AddonDefinition
│
└─ 📄 index.ts
   Public API:
   - getTemplateByIdForLocale(id, locale)
   - getAllTemplatesForLocale(locale)

📁 blocks/
├─ 📁 emptyBlock/
│  ├─ 📄 i18n.ts
│  │  Exports: emptyBlockI18n (KIND i18n)
│  │  Contains: { kind, label, description }
│  │
│  ├─ 📄 schema.ts
│  │  Exports: emptyBlockSchema, emptyBlockDefault
│  │  Contains: Zod schema + default data
│  │
│  └─ 📄 index.ts
│     Exports: emptyPlugin (LandingBlockPlugin)
│
└─ 📄 index.ts
   Exports:
   - createBlockByKind(kind, overrides?, addonOverrides?, label?, description?)
   - landingBlockPlugins (all registered plugins)

📁 addons/
├─ 📁 actionSectionAddon/
│  ├─ 📄 i18n.ts
│  │  Exports: actionSectionAddonI18n (KIND i18n)
│  │  Contains: { kind, label, description, inspector }
│  │
│  ├─ 📄 schema.ts
│  │  Exports: actionSectionAddonSchema, actionSectionAddonDefault
│  │  Contains: Zod schema + default data
│  │
│  ├─ 📄 Inspector.tsx
│  │  Component: Inspector panel for this addon
│  │
│  ├─ 📄 Renderer.tsx
│  │  Component: Frontend renderer for this addon
│  │
│  └─ 📄 index.ts
│     Exports: actionSectionAddonPlugin (LandingAddonPlugin)
│
└─ 📄 index.tsx
   Exports:
   - createAddonByKind(kind, overrides?)
   - landingAddonPlugins (all registered plugins)

📁 utils/translations/
├─ 📄 types.ts
│  Exports: AddonI18n, BlockI18n, Locale types
│
├─ 📄 getBlockI18n.ts
│  Function: Get KIND i18n for a block
│  Registry: blockI18nRegistry = { empty: emptyBlockI18n, ... }
│  Exported: getBlockI18n(kind)
│
├─ 📄 getAddonI18n.ts
│  Function: Get KIND i18n for an addon
│  Registry: addonI18nRegistry = { lotteryAddon: lotteryAddonI18n, ... }
│  Exported: getAddonI18n(kind)
│
├─ 📄 resolveBlockLabel.ts
│  Function: Resolve block label from KIND i18n
│  Exported: resolveBlockLabel(kind, locale)
│
├─ 📄 resolveAddonLabel.ts
│  Function: Resolve addon label from KIND i18n
│  Exported: resolveAddonLabel(kind, locale)
│
├─ 📄 resolveFieldLabel.ts
│  Function: Resolve field label from KIND i18n for inspector
│  Exported: resolveFieldLabel(kind, fieldName, locale)
│
└─ 📄 resolveFieldPlaceholder.ts
   Function: Resolve field placeholder from KIND i18n for inspector
   Exported: resolveFieldPlaceholder(kind, fieldName, locale)
```

---

## Quick Reference

### Creating a New Template

1. **Create Definition** (`definitions/myTemplate.ts`):
   ```typescript
   export const myTemplateDefinition: TemplateDefinition = {
     id: "myTemplate",
     blocks: [
       {
         id: "hero",
         kind: "heroBlock",
         mode: "fixed",
         addons: [
           { id: "cta", kind: "ctaAddon", mode: "fixed" }
         ],
       },
     ],
   };
   ```

2. **Create Meta** (`meta/myTemplate.meta.ts`):
   ```typescript
   export const myTemplateMeta: TemplateMeta = {
     templateId: "myTemplate",
     meta: {
       name: { en: "My Template", fr: "Mon modèle" },
       description: { en: "Description...", fr: "Description..." },
     },
     blocks: {
       hero: {
         label: { en: "Hero Section", fr: "Section héros" },
       },
     },
   };
   ```

3. **Create Defaults** (`defaults/myTemplate.defaults.ts`):
   ```typescript
   export const myTemplateDefaults: TemplateDefaults = {
     templateId: "myTemplate",
     blocks: {
       hero: {
         addons: {
           cta: {
             data: {
               buttonText: { en: "Get Started", fr: "Commencer" },
               showIcon: true,
             },
           },
         },
       },
     },
   };
   ```

4. **Register in index.ts**:
   ```typescript
   export function getTemplateByIdForLocale(id, locale) {
     switch (id) {
       case "myTemplate":
         return translateTemplate(
           myTemplateDefinition,
           myTemplateMeta,
           myTemplateDefaults,
           locale
         );
       // ... other cases
     }
   }
   ```

### Adding KIND i18n for New Addon

1. **Create i18n file** (`addons/myAddon/i18n.ts`):
   ```typescript
   export const myAddonI18n = {
     kind: "myAddon",
     label: { en: "My Addon", fr: "Mon addon" },
     description: { en: "Description...", fr: "Description..." },
     inspector: {
       fields: {
         title: {
           label: { en: "Title", fr: "Titre" },
           placeholder: { en: "Enter title", fr: "Entrer le titre" },
         },
       },
     },
   } as const;
   ```

2. **Register in registry** (`utils/translations/getAddonI18n.ts`):
   ```typescript
   const addonI18nRegistry = {
     myAddon: myAddonI18n,
     // ... other addons
   } as const;
   ```

3. **Use in Inspector**:
   ```typescript
   const titleLabel = resolveFieldLabel("myAddon", "title", locale);
   const titlePlaceholder = resolveFieldPlaceholder("myAddon", "title", locale);
   ```

---

## Summary

This i18n system provides:

- ✅ **Separation of Concerns**: Structure, metadata, and data are isolated
- ✅ **Reusability**: KIND i18n is portable across templates
- ✅ **Flexibility**: Templates can override defaults at any level
- ✅ **Localization**: Runtime extraction of locale-specific values
- ✅ **Fallback Chain**: Always has sensible fallbacks (locale → en → field name)
- ✅ **Type Safety**: All types defined with TypeScript
- ✅ **Testability**: Each layer can be tested independently

The system enables both **template-specific customization** (via meta and defaults) and **portable KIND i18n** (for reuse across templates), while maintaining a clean separation of concerns.
