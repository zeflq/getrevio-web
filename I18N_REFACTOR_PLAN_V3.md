# Landing i18n System Refactor Plan V3

**Status**: Draft
**Version**: 3.0 (Revised for Portability)
**Date**: 2025-12-21

---

## 🎯 Overview

This plan extends V2 with a **portable i18n architecture** that separates:
1. **Base i18n** (addon/block KIND) → Will move to shared package
2. **Instance i18n** (template overrides) → Stays in web app
3. **Inspector** → Only component in web app (uses Next-intl)

### Problems Addressed

1. ✅ **[V2]** Mixed concerns in template structure (structure + i18n + defaults)
2. ✅ **[V2]** `useTranslations` in shared package causing context errors
3. 🆕 **[V3]** Unreadable i18n namespaces in landing editor
4. 🆕 **[V3]** Need portable addons/blocks for shared package
5. 🆕 **[V3]** Inspector uses different namespace than AddonsCard

---

## 🆕 Problem 3: Portability + i18n Ownership (V3)

### Current Issues

**Different namespaces for different purposes**:
```typescript
// In Inspector (for FIELDS - per KIND)
const t = useTranslations("landings.editor.addons.lotteryAddon");
//                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                          Per KIND - shared across instances

// In AddonsCard (for TITLE/DESC - per INSTANCE)
const addonsTranslations = useTranslations("landings.editor.addons.items");
//                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                         Per INSTANCE - can appear multiple times
```

**Why different?**
- Addons/blocks can be **added multiple times** in a template
- Each instance needs its own label (e.g., "Game Title" vs. "Prize Title")
- But inspector fields are shared across all instances (same form fields)

**Goal**: Make addons/blocks **portable** to move to shared package later.

---

## ✅ V3 Solution: Portable i18n Architecture

### Core Principle: Separate KIND i18n from INSTANCE i18n

```
┌─────────────────────────────────────────────────────────┐
│  Addon/Block KIND i18n (Portable)                      │
│  - Base label, description                              │
│  - Inspector field labels                               │
│  - Will move to shared package                          │
│  - NO Next-intl dependency                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Template INSTANCE i18n (Web App)                       │
│  - Override labels for specific instances               │
│  - Context-specific (e.g., "Game Title" vs "Prize Title") │
│  - Uses Next-intl                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 Architecture: Portable 3-Layer System

### Layer 1: KIND i18n (Portable - Shared Package)

**Location**: `packages/landing/src/addons/<addonKind>/i18n.ts`
**Format**: Plain JavaScript object (no Next-intl)
**Purpose**: Base translations for the addon/block KIND

```typescript
// packages/landing/src/addons/lotteryAddon/i18n.ts

export const lotteryAddonI18n = {
  kind: "lotteryAddon",

  // Base label (default for all instances)
  label: {
    en: "Lottery",
    fr: "Loterie",
    ar: "يانصيب"
  },

  description: {
    en: "Add a lottery game to your landing",
    fr: "Ajouter un jeu de loterie",
    ar: "أضف لعبة يانصيب"
  },

  // Inspector fields (shared across all instances)
  inspector: {
    title: {
      en: "Lottery Settings",
      fr: "Paramètres de loterie",
      ar: "إعدادات اليانصيب"
    },
    fields: {
      buttonText: {
        label: {
          en: "Button Text",
          fr: "Texte du bouton",
          ar: "نص الزر"
        },
        placeholder: {
          en: "Enter button text",
          fr: "Entrez le texte",
          ar: "أدخل النص"
        }
      },
      wheelSize: {
        label: {
          en: "Wheel Size",
          fr: "Taille de la roue",
          ar: "حجم العجلة"
        }
      }
    }
  }
} as const;

export type LotteryAddonI18n = typeof lotteryAddonI18n;
```

**Benefits**:
- ✅ No Next-intl dependency
- ✅ Portable to shared package
- ✅ Type-safe
- ✅ Easy to see all translations for a KIND

---

### Layer 2: INSTANCE i18n (Web App - Template Overrides)

**Location**: `messages/[locale]/landings.json`
**Format**: Next-intl flat namespace
**Purpose**: Override labels for specific INSTANCES in templates

```json
// messages/en/landings.json
{
  "landings": {
    "templates": {
      "slotTemplate": {
        "name": "Slot Machine Template",
        "description": "Template for slot machine games",

        "instances": {
          // Instance-specific overrides
          "slot-simple-title": {
            "label": "Game Title"  // ← Override for THIS instance
          },
          "prize-simple-title": {
            "label": "Prize Title"  // ← Different label for another instance of same KIND
          },
          "lottery-section": {
            "label": "Prize Wheel"  // ← Override for lottery instance
          }
        }
      }
    }
  }
}
```

**Benefits**:
- ✅ Context-specific labels per instance
- ✅ Optional (falls back to KIND i18n)
- ✅ Flat namespace
- ✅ Easy to see what's customized per template

---

### Layer 3: Runtime Resolution (Web App)

**Location**: `src/features/landings/utils/translations/`
**Purpose**: Resolve labels with instance override → KIND base → fallback

```typescript
// src/features/landings/utils/translations/resolveAddonLabel.ts

import type { LandingAddonKind } from "@revio/landing";
import { getAddonI18n } from "./getAddonI18n";

/**
 * Resolve addon label with smart fallback:
 * 1. Template instance override (landings.templates.{templateId}.instances.{instanceId}.label)
 * 2. Base KIND i18n (from addon's i18n.ts file)
 * 3. Kind as fallback
 */
export function resolveAddonLabel(
  kind: LandingAddonKind,
  instanceId?: string,
  templateId?: string,
  locale: string = "en",
  t?: (key: string) => string
): string {
  // 1. Try template instance override
  if (t && templateId && instanceId) {
    const overrideKey = `landings.templates.${templateId}.instances.${instanceId}.label`;
    const override = t(overrideKey);
    if (override !== overrideKey) return override;
  }

  // 2. Try base KIND i18n (portable)
  const kindI18n = getAddonI18n(kind);
  if (kindI18n?.label?.[locale]) {
    return kindI18n.label[locale];
  }

  // 3. Fallback to kind
  return kind;
}
```

```typescript
// src/features/landings/utils/translations/getAddonI18n.ts

import { lotteryAddonI18n } from "@revio/landing/addons/lotteryAddon";
import { simpleTitleI18n } from "@revio/landing/addons/simpleTitle";
// ... import all addon i18n

const addonI18nRegistry = {
  lotteryAddon: lotteryAddonI18n,
  simpleTitle: simpleTitleI18n,
  // ... register all addons
} as const;

export function getAddonI18n(kind: LandingAddonKind) {
  return addonI18nRegistry[kind];
}
```

**Benefits**:
- ✅ Clear fallback chain
- ✅ Portable KIND i18n from shared package
- ✅ Instance overrides in web app
- ✅ Works with or without Next-intl

---

## 📊 Key Distinction: KIND vs. INSTANCE

### KIND i18n (Shared Package)

**What**: Base translations for the addon/block TYPE
**Where**: `packages/landing/src/addons/<kind>/i18n.ts`
**Used by**: All instances of this KIND
**Examples**:
- Base label: "Lottery"
- Inspector field labels: "Button Text", "Wheel Size"
- Description: "Add a lottery game"

**Portability**: ✅ No Next-intl, plain JS objects

---

### INSTANCE i18n (Web App)

**What**: Overrides for specific INSTANCES in templates
**Where**: `messages/[locale]/landings.json` under `templates.{id}.instances.{instanceId}`
**Used by**: ONE specific instance
**Examples**:
- Instance "lottery-section" → "Prize Wheel"
- Instance "lottery-footer" → "Footer Game"
- Instance "slot-simple-title" → "Game Title"
- Instance "prize-simple-title" → "Prize Title"

**Portability**: ❌ Web app only (uses Next-intl)

---

## 🗂️ File Organization (Portable)

### Shared Package Structure

```
packages/landing/src/
│
├── addons/
│   ├── lotteryAddon/
│   │   ├── i18n.ts              # 🆕 KIND i18n (portable)
│   │   ├── LotteryAddonRenderer.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── simpleTitle/
│   │   ├── i18n.ts              # 🆕 KIND i18n (portable)
│   │   ├── SimpleTitleRenderer.tsx
│   │   └── index.ts
│   │
│   └── index.ts                 # Export all addon i18n
│
└── blocks/
    ├── empty/
    │   ├── i18n.ts              # 🆕 KIND i18n (portable)
    │   └── EmptyBlockRenderer.tsx
    │
    └── index.ts
```

### Web App Structure

```
src/features/landings/
│
├── templates/
│   ├── definitions/             # Structure (V2)
│   ├── defaults/                # Default values (V2)
│   └── translation/             # Translation logic (V2)
│
├── utils/
│   └── translations/            # 🆕 V3: Instance resolution
│       ├── resolveAddonLabel.ts
│       ├── resolveAddonDescription.ts
│       ├── resolveInspectorTitle.ts
│       ├── resolveFieldLabel.ts
│       ├── resolveFieldPlaceholder.ts
│       ├── getAddonI18n.ts      # Registry of KIND i18n
│       ├── getBlockI18n.ts
│       └── index.ts
│
├── components/
│   ├── editor/
│   │   ├── AddonsCard.tsx       # Uses resolveAddonLabel (INSTANCE)
│   │   └── BlocksCard.tsx
│   │
│   └── inspector/
│       └── AddonInspector.tsx   # Uses resolveFieldLabel (KIND + override)
│
└── addons/                      # Web app wrappers
    └── lotteryAddon/
        └── Inspector.tsx        # Only component with Next-intl

messages/
└── en/
    └── landings.json            # Instance overrides only
        └── templates.*
            └── instances.*      # Instance-specific labels
```

---

## 🎯 Usage Examples

### Example 1: AddonsCard (INSTANCE labels)

```typescript
// src/features/landings/components/editor/AddonsCard.tsx
"use client";

import { resolveAddonLabel, resolveAddonDescription } from "@/features/landings/utils/translations";
import { useTranslations, useLocale } from "next-intl";

export function AddonsCard({
  addon,
  templateId
}: {
  addon: LandingAddon;
  templateId?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();

  // Resolve INSTANCE label (with template override)
  const label = resolveAddonLabel(
    addon.kind,      // KIND
    addon.id,        // INSTANCE id
    templateId,      // Template context
    locale,
    t
  );

  // Resolve description (usually from KIND, no instance override)
  const description = resolveAddonDescription(addon.kind, locale);

  return (
    <Card>
      <CardTitle>{label}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}
```

**Result**:
- Instance "lottery-section" in slotTemplate → "Prize Wheel" (override)
- Instance "lottery-footer" in slotTemplate → "Lottery" (base KIND)
- Instance "lottery-game" in heroTemplate → "Lottery" (base KIND)

---

### Example 2: Inspector (KIND fields + instance context)

```typescript
// src/features/landings/addons/lotteryAddon/Inspector.tsx
"use client";

import { resolveInspectorTitle, resolveFieldLabel, resolveFieldPlaceholder } from "@/features/landings/utils/translations";
import { useTranslations, useLocale } from "next-intl";
import { getAddonI18n } from "@/features/landings/utils/translations/getAddonI18n";

export function LotteryAddonInspector({
  addon,
  templateId
}: {
  addon: LandingAddon;
  templateId?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();

  // Inspector title (KIND-level, but can be overridden per instance)
  const title = resolveInspectorTitle(addon.kind, addon.id, templateId, locale, t);

  // Field labels (KIND-level, shared across all instances)
  const buttonTextLabel = resolveFieldLabel(addon.kind, "buttonText", locale);
  const buttonTextPlaceholder = resolveFieldPlaceholder(addon.kind, "buttonText", locale);

  return (
    <InspectorPanel title={title}>
      <FormField
        label={buttonTextLabel}
        placeholder={buttonTextPlaceholder}
        // ...
      />
    </InspectorPanel>
  );
}
```

**Result**:
- Inspector title: Can be overridden per instance (e.g., "Prize Wheel Settings")
- Field labels: Shared from KIND i18n (e.g., "Button Text")
- No duplication of field labels across instances

---

### Example 3: Template with Multiple Instances

```typescript
// Template definition
{
  id: "empty2",
  kind: "empty",
  addons: [
    {
      id: "slot-simple-title",      // Instance 1
      kind: "simpleTitle",
    },
    {
      id: "prize-simple-title",     // Instance 2 (same KIND)
      kind: "simpleTitle",
    }
  ]
}
```

```json
// messages/en/landings.json
{
  "landings": {
    "templates": {
      "slotTemplate": {
        "instances": {
          "slot-simple-title": {
            "label": "Game Title"    // ← Instance 1 override
          },
          "prize-simple-title": {
            "label": "Prize Title"   // ← Instance 2 override
          }
        }
      }
    }
  }
}
```

**Result**:
- AddonsCard shows "Game Title" for first instance
- AddonsCard shows "Prize Title" for second instance
- Both use same inspector (KIND fields)

---

## 🔄 Resolution Examples

### Scenario 1: No Override

```typescript
resolveAddonLabel("lotteryAddon", "my-lottery", "slotTemplate", "en", t)

// 1. Check override: landings.templates.slotTemplate.instances.my-lottery.label
//    → Not found
// 2. Check KIND i18n: lotteryAddonI18n.label.en
//    → "Lottery" ✅
```

### Scenario 2: With Override

```typescript
resolveAddonLabel("lotteryAddon", "lottery-section", "slotTemplate", "en", t)

// 1. Check override: landings.templates.slotTemplate.instances.lottery-section.label
//    → "Prize Wheel" ✅ (return immediately)
```

### Scenario 3: Field Label (Always KIND)

```typescript
resolveFieldLabel("lotteryAddon", "buttonText", "en")

// 1. Get KIND i18n: lotteryAddonI18n.inspector.fields.buttonText.label.en
//    → "Button Text" ✅
// (No instance override for fields - shared across all instances)
```

---

## 📝 Implementation Guide

### Step 1: Create KIND i18n Files (Shared Package)

```typescript
// packages/landing/src/addons/lotteryAddon/i18n.ts
export const lotteryAddonI18n = {
  kind: "lotteryAddon",

  label: {
    en: "Lottery",
    fr: "Loterie",
    ar: "يانصيب"
  },

  description: {
    en: "Add a lottery game to your landing",
    fr: "Ajouter un jeu de loterie",
    ar: "أضف لعبة يانصيب"
  },

  inspector: {
    title: {
      en: "Lottery Settings",
      fr: "Paramètres de loterie",
      ar: "إعدادات اليانصيب"
    },
    fields: {
      buttonText: {
        label: {
          en: "Button Text",
          fr: "Texte du bouton",
          ar: "نص الزر"
        },
        placeholder: {
          en: "Enter button text",
          fr: "Entrez le texte",
          ar: "أدخل النص"
        }
      },
      wheelSize: {
        label: {
          en: "Wheel Size",
          fr: "Taille de la roue",
          ar: "حجم العجلة"
        }
      }
    }
  }
} as const;
```

```typescript
// packages/landing/src/addons/index.ts
export { lotteryAddonI18n } from "./lotteryAddon/i18n";
export { simpleTitleI18n } from "./simpleTitle/i18n";
// ... export all addon i18n
```

---

### Step 2: Create Translation Utilities (Web App)

```typescript
// src/features/landings/utils/translations/getAddonI18n.ts
import { lotteryAddonI18n, simpleTitleI18n } from "@revio/landing";

const addonI18nRegistry = {
  lotteryAddon: lotteryAddonI18n,
  simpleTitle: simpleTitleI18n,
  // ... all addons
} as const;

export function getAddonI18n(kind: LandingAddonKind) {
  return addonI18nRegistry[kind];
}
```

```typescript
// src/features/landings/utils/translations/resolveAddonLabel.ts
export function resolveAddonLabel(
  kind: LandingAddonKind,
  instanceId?: string,
  templateId?: string,
  locale: string = "en",
  t?: (key: string) => string
): string {
  // 1. Template instance override
  if (t && templateId && instanceId) {
    const key = `landings.templates.${templateId}.instances.${instanceId}.label`;
    const result = t(key);
    if (result !== key) return result;
  }

  // 2. Base KIND i18n
  const kindI18n = getAddonI18n(kind);
  if (kindI18n?.label?.[locale]) {
    return kindI18n.label[locale];
  }

  // 3. Fallback
  return kind;
}
```

```typescript
// src/features/landings/utils/translations/resolveAddonDescription.ts
export function resolveAddonDescription(
  kind: LandingAddonKind,
  locale: string = "en"
): string | undefined {
  const kindI18n = getAddonI18n(kind);
  return kindI18n?.description?.[locale];
}
```

```typescript
// src/features/landings/utils/translations/resolveFieldLabel.ts
export function resolveFieldLabel(
  kind: LandingAddonKind,
  fieldName: string,
  locale: string = "en"
): string {
  const kindI18n = getAddonI18n(kind);
  const label = kindI18n?.inspector?.fields?.[fieldName]?.label?.[locale];
  return label ?? fieldName;
}
```

```typescript
// src/features/landings/utils/translations/resolveFieldPlaceholder.ts
export function resolveFieldPlaceholder(
  kind: LandingAddonKind,
  fieldName: string,
  locale: string = "en"
): string | undefined {
  const kindI18n = getAddonI18n(kind);
  return kindI18n?.inspector?.fields?.[fieldName]?.placeholder?.[locale];
}
```

```typescript
// src/features/landings/utils/translations/resolveInspectorTitle.ts
export function resolveInspectorTitle(
  kind: LandingAddonKind,
  instanceId?: string,
  templateId?: string,
  locale: string = "en",
  t?: (key: string) => string
): string {
  // 1. Template instance override (optional)
  if (t && templateId && instanceId) {
    const key = `landings.templates.${templateId}.instances.${instanceId}.inspector.title`;
    const result = t(key);
    if (result !== key) return result;
  }

  // 2. Base KIND i18n
  const kindI18n = getAddonI18n(kind);
  if (kindI18n?.inspector?.title?.[locale]) {
    return kindI18n.inspector.title[locale];
  }

  // 3. Fallback to label
  return resolveAddonLabel(kind, instanceId, templateId, locale, t);
}
```

---

### Step 3: Update messages/en/landings.json

```json
{
  "landings": {
    "templates": {
      "slotTemplate": {
        "name": "Slot Machine Template",
        "description": "Template for slot machine games",

        "instances": {
          "slot-simple-title": {
            "label": "Game Title"
          },
          "prize-simple-title": {
            "label": "Prize Title"
          },
          "lottery-section": {
            "label": "Prize Wheel",
            "inspector": {
              "title": "Prize Wheel Settings"
            }
          }
        }
      }
    }
  }
}
```

**Note**: Only instance-specific overrides, no KIND i18n here!

---

### Step 4: Update Components

**AddonsCard**:
```typescript
// src/features/landings/components/editor/AddonsCard.tsx
"use client";

import { resolveAddonLabel, resolveAddonDescription } from "@/features/landings/utils/translations";
import { useTranslations, useLocale } from "next-intl";

export function AddonsCard({ addon, templateId }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  const label = resolveAddonLabel(addon.kind, addon.id, templateId, locale, t);
  const description = resolveAddonDescription(addon.kind, locale);

  return (
    <Card>
      <CardTitle>{label}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </Card>
  );
}
```

**Inspector**:
```typescript
// src/features/landings/addons/lotteryAddon/Inspector.tsx
"use client";

import {
  resolveInspectorTitle,
  resolveFieldLabel,
  resolveFieldPlaceholder
} from "@/features/landings/utils/translations";
import { useTranslations, useLocale } from "next-intl";

export function LotteryAddonInspector({ addon, templateId }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  const title = resolveInspectorTitle(addon.kind, addon.id, templateId, locale, t);

  return (
    <InspectorPanel title={title}>
      <FormField
        label={resolveFieldLabel(addon.kind, "buttonText", locale)}
        placeholder={resolveFieldPlaceholder(addon.kind, "buttonText", locale)}
        // ...
      />
      <FormField
        label={resolveFieldLabel(addon.kind, "wheelSize", locale)}
        // ...
      />
    </InspectorPanel>
  );
}
```

---

## 📊 Comparison: Before vs. After (V3 Portable)

### Before: Non-Portable

```typescript
// Shared package renderer
import { useTranslations } from "next-intl";  // ❌ Dependency!

function LotteryRenderer() {
  const t = useTranslations("landings.editor.addons.lotteryAddon");
  // ❌ Can't move to shared package
}
```

### After: Portable

```typescript
// Shared package - KIND i18n
export const lotteryAddonI18n = {
  kind: "lotteryAddon",
  label: { en: "Lottery", fr: "Loterie" },
  inspector: { /* ... */ }
};  // ✅ No Next-intl dependency!

// Web app - uses KIND i18n
const label = resolveAddonLabel("lotteryAddon", instanceId, templateId, locale, t);
// ✅ Portable KIND i18n + instance overrides
```

---

## 🔄 Migration Path (V3)

### Phase 1: Create KIND i18n Files (Shared Package)

**Tasks**:
1. Create `i18n.ts` for each addon in `packages/landing/src/addons/<kind>/`
2. Create `i18n.ts` for each block in `packages/landing/src/blocks/<kind>/`
3. Export all KIND i18n from `packages/landing/src/addons/index.ts`
4. Add types for i18n structure

**Result**: ✅ Portable KIND i18n ready

---

### Phase 2: Create Translation Utilities (Web App)

**Tasks**:
1. Create `getAddonI18n.ts` - registry of KIND i18n
2. Create `getBlockI18n.ts` - registry of block i18n
3. Create `resolveAddonLabel.ts` - label resolution
4. Create `resolveAddonDescription.ts` - description resolution
5. Create `resolveInspectorTitle.ts` - inspector title resolution
6. Create `resolveFieldLabel.ts` - field label resolution
7. Create `resolveFieldPlaceholder.ts` - placeholder resolution

**Result**: ✅ Utilities ready

---

### Phase 3: Migrate messages/en/landings.json

**Tasks**:
1. Remove all KIND i18n (move to shared package)
2. Keep only INSTANCE overrides under `templates.{id}.instances.*`
3. Clean up old nested namespaces

**Result**: ✅ Clean instance-only i18n

---

### Phase 4: Update Components

**Tasks**:
1. Update `AddonsCard` to use `resolveAddonLabel`
2. Update `BlocksCard` to use `resolveBlockLabel`
3. Update all inspector components to use `resolveFieldLabel`, etc.
4. Remove old `useTranslations` calls with deep namespaces

**Result**: ✅ All components use new utilities

---

### Phase 5: Verify Portability

**Tasks**:
1. Verify no Next-intl in shared package
2. Verify all KIND i18n accessible from web app
3. Test instance overrides work correctly
4. Test inspector field labels work

**Result**: ✅ Ready to move to shared package

---

## ✅ Benefits Summary (V3 Portable)

| Aspect | Before | After |
|--------|--------|-------|
| **Portability** | ❌ Next-intl in shared package | ✅ Plain JS objects |
| **KIND i18n** | ❌ Scattered in web app | ✅ Co-located with addon code |
| **Instance labels** | ❌ Hard to override | ✅ Clear override mechanism |
| **Inspector fields** | ❌ Different namespace | ✅ From KIND i18n (portable) |
| **Duplication** | ❌ Same KIND in multiple places | ✅ Single source per KIND |
| **Namespace depth** | ❌ 7+ levels | ✅ 4-5 levels max |
| **Maintainability** | ❌ Hard to track | ✅ Clear ownership |

---

## 🎯 Ownership Model (Final)

### KIND i18n (Shared Package)

**Who owns**: Plugin/addon developer
**Location**: `packages/landing/src/addons/<kind>/i18n.ts`
**Contains**:
- Base label
- Description
- Inspector title
- Inspector field labels
- Inspector field placeholders

**Format**: Plain JS object (no framework dependency)

**Example**:
```typescript
export const lotteryAddonI18n = {
  kind: "lotteryAddon",
  label: { en: "Lottery" },
  inspector: {
    fields: {
      buttonText: {
        label: { en: "Button Text" }
      }
    }
  }
};
```

---

### INSTANCE i18n (Web App)

**Who owns**: Template developer
**Location**: `messages/[locale]/landings.json` under `templates.{id}.instances.{instanceId}`
**Contains**:
- Instance-specific label overrides
- Optional inspector title overrides

**Format**: Next-intl namespace

**Example**:
```json
{
  "landings": {
    "templates": {
      "slotTemplate": {
        "instances": {
          "lottery-section": {
            "label": "Prize Wheel"
          }
        }
      }
    }
  }
}
```

---

## 🧪 Testing Strategy (V3)

### Test KIND i18n (Shared Package)

```typescript
// packages/landing/src/addons/lotteryAddon/__tests__/i18n.test.ts
import { lotteryAddonI18n } from "../i18n";

describe("lotteryAddonI18n", () => {
  it("should have all required fields", () => {
    expect(lotteryAddonI18n.kind).toBe("lotteryAddon");
    expect(lotteryAddonI18n.label.en).toBe("Lottery");
    expect(lotteryAddonI18n.inspector.fields.buttonText.label.en).toBe("Button Text");
  });

  it("should have all locales", () => {
    expect(lotteryAddonI18n.label.fr).toBeDefined();
    expect(lotteryAddonI18n.label.ar).toBeDefined();
  });
});
```

---

### Test Translation Utilities (Web App)

```typescript
// src/features/landings/utils/translations/__tests__/resolveAddonLabel.test.ts
import { resolveAddonLabel } from "../resolveAddonLabel";

describe("resolveAddonLabel", () => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      "landings.templates.slotTemplate.instances.lottery-section.label": "Prize Wheel",
    };
    return translations[key] ?? key;
  };

  it("should return base KIND label", () => {
    expect(resolveAddonLabel("lotteryAddon", undefined, undefined, "en"))
      .toBe("Lottery");
  });

  it("should return instance override", () => {
    expect(resolveAddonLabel("lotteryAddon", "lottery-section", "slotTemplate", "en", mockT))
      .toBe("Prize Wheel");
  });

  it("should work with different locales", () => {
    expect(resolveAddonLabel("lotteryAddon", undefined, undefined, "fr"))
      .toBe("Loterie");
  });
});
```

---

## 🎉 Conclusion (V3 Portable)

### Portability Model

**Q: How do we make addons/blocks portable?**
✅ **Answer**: KIND i18n in shared package (plain JS), instance i18n in web app (Next-intl).

**Q: Why different namespaces for Inspector vs. AddonsCard?**
✅ **Answer**:
- **Inspector**: Uses KIND i18n (shared across instances) - field labels are the same
- **AddonsCard**: Uses INSTANCE i18n (per instance) - labels can be different per instance

**Q: How do templates override labels?**
✅ **Answer**: Via `landings.templates.{id}.instances.{instanceId}.label`

### Key Principles

1. **KIND i18n is Portable** - Plain JS objects, no framework dependency
2. **INSTANCE i18n is Contextual** - Next-intl, template-specific overrides
3. **Inspector Fields are Shared** - Same fields across all instances (KIND)
4. **Instance Labels are Unique** - Different labels per instance (INSTANCE)
5. **Clear Fallback Chain** - Instance override → KIND base → fallback

### Migration Benefits

- ✅ **Portability**: Addons can move to shared package
- ✅ **Clarity**: Clear distinction between KIND and INSTANCE
- ✅ **Flexibility**: Templates can customize instance labels
- ✅ **Consistency**: Field labels shared across instances
- ✅ **Maintainability**: Single source per KIND

---

## 📋 Complete Implementation Checklist

**Phase 1: KIND i18n (Shared Package)**
- ☐ Create `i18n.ts` for each addon in `packages/landing/src/addons/`
- ☐ Create `i18n.ts` for each block in `packages/landing/src/blocks/`
- ☐ Export all KIND i18n from package index
- ☐ Add TypeScript types for i18n structure

**Phase 2: Translation Utilities (Web App)**
- ☐ Create `getAddonI18n.ts` registry
- ☐ Create `getBlockI18n.ts` registry
- ☐ Create `resolveAddonLabel.ts`
- ☐ Create `resolveAddonDescription.ts`
- ☐ Create `resolveInspectorTitle.ts`
- ☐ Create `resolveFieldLabel.ts`
- ☐ Create `resolveFieldPlaceholder.ts`

**Phase 3: Instance i18n (Web App)**
- ☐ Restructure `messages/[locale]/landings.json`
- ☐ Move KIND i18n to shared package
- ☐ Keep only instance overrides in `templates.*.instances.*`
- ☐ Remove old nested namespaces

**Phase 4: Update Components**
- ☐ Update `AddonsCard` to use `resolveAddonLabel`
- ☐ Update `BlocksCard` to use `resolveBlockLabel`
- ☐ Update all inspector components to use field resolvers
- ☐ Remove old `useTranslations` with deep namespaces

**Phase 5: Testing & Verification**
- ☐ Add tests for KIND i18n
- ☐ Add tests for translation utilities
- ☐ Verify no Next-intl in shared package
- ☐ Test instance overrides work correctly
- ☐ Test all locales work

---

**Status**: Ready for implementation
**Estimated Effort**: 2-3 days
**Priority**: High (enables portability)
