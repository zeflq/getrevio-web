# Landing i18n Migration Guide

**For**: Migrating remaining addons to portable KIND i18n pattern
**Reference**: See lotteryAddon and simpleTitle for working examples

---

## 📋 Quick Checklist per Addon

For each addon to migrate:

- [ ] Create `i18n.ts` file in addon directory
- [ ] Extract translations from `messages/en.json` and `messages/fr.json`
- [ ] Structure with: kind, label, description, inspector (title + fields)
- [ ] Add to registry in `getAddonI18n.ts`
- [ ] Update Inspector component to use utilities
- [ ] Test in landing editor
- [ ] Remove old translations from messages files (optional, after all migrated)

---

## 🎯 Step-by-Step Migration Process

### Step 1: Extract Current Translations

Find translations for your addon in both locale files:

```bash
# English
cat messages/en.json | jq '.landings.editor.addons.items.<addonName>'
cat messages/en.json | jq '.landings.editor.addons.<addonName>'

# French
cat messages/fr.json | jq '.landings.editor.addons.items.<addonName>'
cat messages/fr.json | jq '.landings.editor.addons.<addonName>'
```

**Example for footerAddon**:
```json
// messages/en.json
{
  "landings": {
    "editor": {
      "addons": {
        "items": {
          "footerAddon": {
            "label": "Footer",
            "description": "Display a footer section..."
          }
        },
        "footerAddon": {
          "text": "Footer Text"
        }
      }
    }
  }
}
```

---

### Step 2: Create i18n.ts File

Create `src/features/landings/addons/<addonName>/i18n.ts`:

```typescript
/**
 * KIND i18n for <addonName>
 *
 * This file contains portable translations for the <addon> addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n.
 */

export const <addonName>I18n = {
  kind: "<addonName>",

  // Base label (can be overridden per instance in templates)
  label: {
    en: "Footer",
    fr: "Pied de page",
  },

  // Description (shared across instances)
  description: {
    en: "Display a footer section with logo, links, or legal information.",
    fr: "Afficher une section de pied de page avec logo, liens ou mentions légales.",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Footer Settings",
      fr: "Paramètres du pied de page",
    },
    fields: {
      text: {
        label: {
          en: "Footer Text",
          fr: "Texte du pied de page",
        },
        placeholder: {
          en: "Enter footer text",
          fr: "Entrez le texte du pied de page",
        },
      },
      // Add more fields as needed
    },
  },
} as const;

export type <AddonName>I18n = typeof <addonName>I18n;
```

**Important**: Use exact field names from your schema!

---

### Step 3: Add to Registry

Update `src/features/landings/utils/translations/getAddonI18n.ts`:

```typescript
import { lotteryAddonI18n } from "../../addons/lotteryAddon/i18n";
import { simpleTitleI18n } from "../../addons/simpleTitle/i18n";
import { footerAddonI18n } from "../../addons/footerAddon/i18n"; // ✅ ADD

const addonI18nRegistry = {
  lotteryAddon: lotteryAddonI18n,
  simpleTitle: simpleTitleI18n,
  footerAddon: footerAddonI18n, // ✅ ADD
  // ... add more
} as const;
```

---

### Step 4: Update Inspector Component

#### Before (using useTranslations):
```typescript
"use client";

import { useTranslations } from "next-intl";
import { RHFInput } from "@/components/form/controls";

export function FooterAddonInspector({ fieldName, disabled }) {
  const t = useTranslations("landings.editor.addons.footerAddon");

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.text`}
        label={t("text")}
        disabled={disabled}
      />
    </div>
  );
}
```

#### After (using KIND i18n utilities):
```typescript
"use client";

import { useLocale } from "next-intl";
import { RHFInput } from "@/components/form/controls";
import { resolveFieldLabel, resolveFieldPlaceholder } from "../../utils/translations";

export function FooterAddonInspector({ fieldName, disabled }) {
  const locale = useLocale() as "en" | "fr" | "ar";

  // Use KIND i18n for field labels (shared across all instances)
  const textLabel = resolveFieldLabel("footerAddon", "text", locale);
  const textPlaceholder = resolveFieldPlaceholder("footerAddon", "text", locale);

  return (
    <div className="space-y-4">
      <RHFInput
        name={`${fieldName}.text`}
        label={textLabel}
        placeholder={textPlaceholder}
        disabled={disabled}
      />
    </div>
  );
}
```

**Pattern**:
1. Replace `useTranslations()` with `useLocale()`
2. For each field, call `resolveFieldLabel(kind, fieldName, locale)`
3. Optionally add placeholders with `resolveFieldPlaceholder()`
4. Use resolved values in form components

---

### Step 5: Test

1. Run the app: `npm run dev`
2. Navigate to landing editor
3. Add the addon to a landing
4. Verify:
   - ✅ Addon label shows correctly in AddonsCard
   - ✅ Description shows correctly
   - ✅ Inspector field labels show correctly
   - ✅ Switch locale (en → fr) and verify translations

---

### Step 6: Optional - Add Instance Overrides

If you want template-specific labels, add to `messages/en.json`:

```json
{
  "landings": {
    "templates": {
      "yourTemplate": {
        "instances": {
          "footer-main": {
            "label": "Main Footer"
          },
          "footer-secondary": {
            "label": "Secondary Footer"
          }
        }
      }
    }
  }
}
```

**Note**: This is OPTIONAL. Most addons won't need instance overrides.

---

## 🧩 Field Mapping Reference

### Common Field Types

```typescript
inspector: {
  fields: {
    // Text input
    text: {
      label: { en: "Text", fr: "Texte" },
      placeholder: { en: "Enter text", fr: "Entrez le texte" },
    },

    // Title
    title: {
      label: { en: "Title", fr: "Titre" },
      placeholder: { en: "Enter title", fr: "Entrez le titre" },
    },

    // Description / Subtitle
    subtitle: {
      label: { en: "Subtitle", fr: "Sous-titre" },
      placeholder: { en: "Enter subtitle (optional)", fr: "Entrez le sous-titre (optionnel)" },
    },

    // Button
    buttonLabel: {
      label: { en: "Button Label", fr: "Étiquette du bouton" },
      placeholder: { en: "Enter button text", fr: "Entrez le texte du bouton" },
    },

    // Link / URL
    link: {
      label: { en: "Link", fr: "Lien" },
      placeholder: { en: "https://example.com", fr: "https://exemple.com" },
    },

    // Select / Dropdown
    provider: {
      label: { en: "Provider", fr: "Fournisseur" },
      placeholder: { en: "Select provider", fr: "Sélectionnez un fournisseur" },
    },
  },
}
```

---

## 📝 Addon-Specific Notes

### actionSectionAddon
**Schema fields**: title, subtitle, description, buttonLabel
**Special**: Has multiple text fields, make sure all are translated

### footerAddon
**Schema fields**: text
**Special**: Simple addon, good for practice

### actionsdrawerAddon
**Schema fields**: provider (select)
**Special**: Has nested configuration, be careful with field names

### googleReviewActionDrawerAddon
**Schema fields**: Multiple text fields for steps
**Special**: Complex structure, check schema carefully

### instagramActionDrawerAddon
**Schema fields**: triggerLabel, title, description, incentiveText, primaryLabel, footerText
**Special**: Many text fields, comprehensive translations needed

### sloteBanner
**Schema fields**: TBD - check schema.ts
**Special**: Check current implementation

### winningDrawerAddon
**Schema fields**: TBD - check schema.ts
**Special**: Check current implementation

---

## 🚨 Common Pitfalls

### 1. Wrong Field Name
```typescript
// ❌ WRONG - field name doesn't match schema
resolveFieldLabel("footerAddon", "footerText", locale)

// ✅ CORRECT - matches schema field name
resolveFieldLabel("footerAddon", "text", locale)
```

**Fix**: Always check `schema.ts` for exact field names!

### 2. Missing Translations
```typescript
// ❌ WRONG - only English
label: { en: "Footer" }

// ✅ CORRECT - at least English + French
label: { en: "Footer", fr: "Pied de page" }
```

**Fix**: Always add French translations (Arabic optional for now)

### 3. Forgetting to Add to Registry
```typescript
// ❌ WRONG - created i18n.ts but didn't add to registry
// Users will see fallback to kind name

// ✅ CORRECT - added to getAddonI18n.ts registry
const addonI18nRegistry = {
  ...,
  footerAddon: footerAddonI18n,
}
```

**Fix**: Always update `getAddonI18n.ts` after creating i18n file

### 4. Using useTranslations Instead of useLocale
```typescript
// ❌ WRONG - still using old pattern
const t = useTranslations("landings.editor.addons.footerAddon");
label={t("text")}

// ✅ CORRECT - new pattern
const locale = useLocale() as "en" | "fr" | "ar";
const textLabel = resolveFieldLabel("footerAddon", "text", locale);
label={textLabel}
```

---

## 🧪 Testing Checklist

For each migrated addon:

- [ ] English labels show correctly
- [ ] French labels show correctly
- [ ] Field labels match schema field names
- [ ] Placeholders work (if defined)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Addon appears in AddonsCard with correct label
- [ ] Inspector opens with correct field labels
- [ ] Switching locale updates all labels

---

## 📊 Migration Progress Tracker

Track which addons have been migrated:

- [x] lotteryAddon - ✅ Complete (reference)
- [x] simpleTitle - ✅ Complete (reference)
- [ ] footerAddon
- [ ] actionSectionAddon
- [ ] sloteBanner
- [ ] actionsdrawerAddon
- [ ] googleReviewActionDrawerAddon
- [ ] instagramActionDrawerAddon
- [ ] winningDrawerAddon

---

## 🎯 Priority Order

Recommended migration order:

1. **Simple addons** (1-2 fields):
   - footerAddon
   - actionSectionAddon
   - sloteBanner

2. **Medium addons** (3-5 fields):
   - actionsdrawerAddon

3. **Complex addons** (5+ fields):
   - googleReviewActionDrawerAddon
   - instagramActionDrawerAddon
   - winningDrawerAddon

---

## 🤝 Need Help?

**Reference Examples**:
- `src/features/landings/addons/lotteryAddon/` - Complete example
- `src/features/landings/addons/simpleTitle/` - Simpler example

**Check**:
- Schema file: `<addon>/schema.ts` - For exact field names
- Current Inspector: `<addon>/Inspector.tsx` - For current implementation
- Messages files: `messages/en.json` and `messages/fr.json` - For current translations

**Common Issues**:
1. TypeScript errors → Check field names match schema
2. Missing translations → Check i18n file has en + fr
3. Addon not in registry → Update `getAddonI18n.ts`
4. Labels not showing → Check import path in Inspector

---

**Good luck with the migration! 🚀**

Start with footerAddon as it's the simplest addon to migrate.
