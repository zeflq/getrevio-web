# Landing Templates - KIND I18n Pattern

This directory contains landing templates using the KIND i18n pattern, matching the approach used in addons and blocks.

## Structure

```
templates/
├── definitions/        # Pure structure (blocks, addons, config)
├── i18n/               # Actual translations (KIND pattern)
├── defaults/           # Default data values
├── translation/        # Runtime combination logic
├── scripts/            # Export scripts
└── index.ts            # Public API
```

## KIND I18n Pattern

Templates now use the same i18n pattern as addons and blocks:

### Before (Key Paths)
```typescript
blocks: {
  empty1: {
    label: "defaultValues.empty1.label" // ❌ Key path, not translation
  }
}
```

### After (Actual Translations)
```typescript
blocks: {
  empty1: {
    label: {
      en: "Page 1",
      fr: "Page 1",
      ar: "صفحة 1"
    }
  }
}
```

## Benefits

- ✅ **Portable**: No dependency on external messages files
- ✅ **Co-located**: Translations live with template structure
- ✅ **Consistent**: Same pattern as addons/blocks
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Easy to maintain**: Clear translation structure

## Files

### 1. Template Definition (`definitions/slotTemplate.ts`)

Pure structure with no i18n or defaults:

```typescript
export const slotTemplateDefinition: TemplateDefinition = {
  id: "slotTemplate",
  blocks: [
    {
      id: "empty1",
      kind: "empty",
      mode: "fixed",
      addons: [...]
    }
  ]
};
```

### 2. Template I18n (`i18n/slotTemplate.i18n.ts`)

Actual translations in all languages:

```typescript
export const slotTemplateI18n: TemplateI18nMap = {
  templateId: "slotTemplate",

  meta: {
    name: {
      en: "Slot game Reloaded",
      fr: "Slot game Reloaded",
      ar: "لعبة السلوت المعاد تحميلها"
    },
    description: {
      en: "A template optimized for game landings",
      fr: "Un modèle optimisé pour les landings de jeux",
      ar: "قالب محسّن لصفحات الألعاب"
    }
  },

  blocks: {
    empty1: {
      label: {
        en: "Page 1",
        fr: "Page 1",
        ar: "صفحة 1"
      }
    }
  },

  addons: {
    "slot-simple-title": {
      title: {
        en: "Spin to Reveal Your Gift",
        fr: "A vous de jouer !",
        ar: "أدر لتكشف عن هديتك"
      }
    }
  }
};
```

### 3. Template Defaults (`defaults/slotTemplate.defaults.ts`)

Non-i18n default data:

```typescript
export const slotTemplateDefaults: TemplateDefaults = {
  templateId: "slotTemplate",
  blocks: {
    empty1: {
      data: {
        // Non-i18n defaults (if any)
      }
    }
  }
};
```

## How It Works

### 1. Build Time

At module load time, templates are built using `translateTemplate()`:

```typescript
const slotTemplate = translateTemplate(
  slotTemplateDefinition,
  slotTemplateI18n,
  slotTemplateDefaults
);
```

This generates a template with i18n references:

```typescript
{
  id: "slotTemplate",
  blocks: [
    {
      id: "empty1",
      kind: "empty",
      label: "i18n:templates.slotTemplate.blocks.empty1.label",
      addons: [
        {
          id: "slot-simple-title",
          defaultData: {
            title: "i18n:templates.slotTemplate.addons.slot-simple-title.title"
          }
        }
      ]
    }
  ]
}
```

### 2. Runtime

Components resolve these i18n references using `useTranslations`:

```typescript
const t = useTranslations('templates.slotTemplate.blocks.empty1');
const label = t('label'); // Resolves to current locale
```

### 3. Messages Files

The i18n translations are exported to messages files for use with next-intl:

```bash
npx tsx src/features/landings/templates/scripts/exportI18n.ts
```

This syncs:
- `slotTemplateI18n` → `messages/en.json`
- `slotTemplateI18n` → `messages/fr.json`
- `slotTemplateI18n` → `messages/ar.json`

The exported structure matches the existing format:

```json
{
  "landings": {
    "templates": {
      "slotTemplate": {
        "defaultValues": {
          "empty1": {
            "label": "Page 1"
          },
          "empty2": {
            "addons": {
              "slot-simple-title": {
                "title": "Spin to Reveal Your Gift"
              }
            }
          }
        }
      }
    }
  }
}
```

## Adding a New Template

1. **Create definition** (`definitions/myTemplate.ts`):
   ```typescript
   export const myTemplateDefinition: TemplateDefinition = {
     id: "myTemplate",
     blocks: [...]
   };
   ```

2. **Create i18n** (`i18n/myTemplate.i18n.ts`):
   ```typescript
   export const myTemplateI18n: TemplateI18nMap = {
     templateId: "myTemplate",
     meta: {
       name: { en: "...", fr: "...", ar: "..." },
       description: { en: "...", fr: "...", ar: "..." }
     },
     blocks: {...},
     addons: {...}
   };
   ```

3. **Create defaults** (`defaults/myTemplate.defaults.ts`):
   ```typescript
   export const myTemplateDefaults: TemplateDefaults = {
     templateId: "myTemplate",
     blocks: {...}
   };
   ```

4. **Export template** (`index.ts`):
   ```typescript
   import { myTemplateDefinition } from "./definitions/myTemplate";
   import { myTemplateI18n } from "./i18n/myTemplate.i18n";
   import { myTemplateDefaults } from "./defaults/myTemplate.defaults";

   const myTemplate = translateTemplate(
     myTemplateDefinition,
     myTemplateI18n,
     myTemplateDefaults
   );

   export const landingTemplates = [slotTemplate, myTemplate];
   ```

5. **Export i18n** (update `scripts/exportI18n.ts`):
   ```typescript
   const templates = [
     { id: "slotTemplate", i18n: slotTemplateI18n },
     { id: "myTemplate", i18n: myTemplateI18n },
   ];
   ```

6. **Run export**:
   ```bash
   npx tsx src/features/landings/templates/scripts/exportI18n.ts
   ```

## Migration Notes

The new pattern maintains backwards compatibility:

- ✅ Same i18n reference format (`i18n:templates.{id}.{path}`)
- ✅ Same messages file structure
- ✅ Components work without changes
- ✅ Translations are portable and co-located

The key difference is that translations now live in the i18n file (KIND pattern) and are exported to messages files, rather than being defined in messages files directly.

## See Also

- **Addon I18n**: `src/features/landings/addons/lotteryAddon/i18n.ts`
- **Block I18n**: Similar pattern in blocks
- **Export Script**: `scripts/exportI18n.ts`
