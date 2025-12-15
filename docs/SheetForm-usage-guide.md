# SheetForm Usage Guide

## Overview

`SheetForm` is a reusable component that provides consistent UI/UX for sheet-based forms across the application. It wraps form content in a sheet dialog with consistent styling (`sm:max-w-[560px] w-full gap-0`).

## When to Use `skipFormProvider`

The `skipFormProvider` prop controls whether `SheetForm` wraps its content in a `FormProvider`. Understanding when to use this prop is critical to avoid race conditions.

### ❌ Race Condition: Nested FormProviders

**Problem:** If you're already inside a `FormProvider` (from a parent edit page) and `SheetForm` creates another `FormProvider` with the **same form instance**, this creates nested providers that cause:
- Race conditions during form state updates
- Stale closures (inner provider may not re-render with outer)
- Conflicting field registrations
- Unpredictable form submission behavior

### Rule of Thumb

**Ask yourself:** Is this sheet editing part of an existing form, or managing its own independent form?

| Scenario | Form Context | `skipFormProvider` | Example |
|----------|--------------|-------------------|---------|
| **Sheet edits part of parent form** | Uses `useFormContext()` to get parent form | ✅ `true` | `EditorSheetCard` |
| **Sheet has its own independent form** | Creates new form with `useForm()` | ❌ `false` (default) | `EditGiftSheet`, `EditPlaceSheet` |

## Examples

### ✅ Use `skipFormProvider={true}` - Editing Part of Parent Form

**Scenario:** A sheet that opens to edit a specific section of a larger form (like landing blocks/addons)

```typescript
// Parent: EditPageContainer provides FormProvider
<FormProvider {...form}>
  <LandingContentEditor />
</FormProvider>

// Child: EditorSheetCard uses parent form
export function EditorSheetCard({ content }) {
  const form = useFormContext(); // ← Uses PARENT form

  return (
    <SheetForm
      methods={form}
      skipFormProvider={true} // ← REQUIRED to avoid nested providers
      // ...
    >
      {content}
    </SheetForm>
  );
}
```

**FormProvider Hierarchy:**
```
EditPageContainer → FormProvider (landing form)
  └─ EditorSheetCard → useFormContext() (landing form)
      └─ SheetForm (skipFormProvider=true) ✅
          └─ LotteryAddonInspector
```

### ✅ Default Behavior - Independent Form

**Scenario:** A sheet that creates and manages its own form (like editing a gift from a listing table)

```typescript
// LotteriesGiftsTab uses parent form for lottery config
const { control } = useFormContext<LotteryConfigFormValues>();

// EditGiftSheet creates its OWN independent form
export function EditGiftSheet({ initialGift, onSave }) {
  const methods = useForm<GiftFormValue>({ // ← Creates NEW form
    defaultValues: initialGift,
    resolver: zodResolver(giftSchema),
  });

  return (
    <SheetForm
      methods={methods}
      // skipFormProvider not needed (defaults to false)
      onSubmit={onSave}
    >
      <RHFInput name="name" />
      <RHFInput name="weight" />
      {/* ... */}
    </SheetForm>
  );
}
```

**FormProvider Hierarchy:**
```
EditPageContainer → FormProvider (lottery form)
  └─ LotteriesGiftsTab → useFormContext() (lottery form)
      └─ EditGiftSheet → useForm() (NEW gift form) ✅
          └─ SheetForm → FormProvider (gift form) ✅
```

## Quick Decision Tree

```
Is SheetForm being used inside a component that already has a FormProvider?
│
├─ YES → Does the sheet use `useFormContext()` to get the parent form?
│   │
│   ├─ YES → Use `skipFormProvider={true}` ✅
│   │         (Example: EditorSheetCard)
│   │
│   └─ NO → Does the sheet create its own form with `useForm()`?
│       │
│       ├─ YES → Don't use skipFormProvider (default behavior) ✅
│       │         (Example: EditGiftSheet)
│       │
│       └─ ERROR → Sheet must either use parent form or create its own ❌
│
└─ NO → Don't use skipFormProvider (default behavior) ✅
          (Example: Standalone sheets from listing tables)
```

## Common Use Cases

### 1. Listing Tables → Edit Sheet (Default Behavior)
- **Context:** Clicked "Edit" from a data table
- **Form:** Sheet creates its own form
- **skipFormProvider:** `false` (default)
- **Examples:** `EditPlaceSheet`, `EditMerchantSheet`, `EditCampaignSheet`, `EditThemeSheet`

### 2. Edit Page → Inspector Sheet (Use skipFormProvider)
- **Context:** Editing a section within a larger edit page
- **Form:** Sheet uses parent form via `useFormContext()`
- **skipFormProvider:** `true`
- **Examples:** `EditorSheetCard` (for landing blocks/addons)

### 3. Edit Page → Nested Independent Form (Default Behavior)
- **Context:** Within an edit page, but editing a separate entity
- **Form:** Sheet creates its own independent form
- **skipFormProvider:** `false` (default)
- **Examples:** `EditGiftSheet` (editing a gift within lottery edit page)

## Troubleshooting

### Symptoms of Incorrect Usage

**Missing `skipFormProvider={true}` when needed:**
- Form values not updating correctly
- Fields showing stale data
- Form submission triggers multiple times
- React Hook Form errors about multiple providers

**Using `skipFormProvider={true}` incorrectly:**
- "useFormContext must be used within FormProvider" errors
- Form fields not registering
- No form context available

### Solution

1. Trace the FormProvider hierarchy
2. Identify if the sheet uses parent form (`useFormContext()`) or creates its own (`useForm()`)
3. Apply `skipFormProvider={true}` only if using parent form

## Related Files

- `/src/components/form/SheetForm.tsx` - Main component
- `/src/features/landings/editor/ui/EditorSheetCard.tsx` - Example with `skipFormProvider={true}`
- `/src/features/lotteries/components/gifts/EditGiftSheet.tsx` - Example without `skipFormProvider`
- `/src/shared/ui/EditPageContainer.tsx` - Provides top-level FormProvider for edit pages
