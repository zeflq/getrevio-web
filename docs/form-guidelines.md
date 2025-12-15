# Form Guidelines for Edit Pages

> **Version:** 1.0
> **Last Updated:** 2025-12-14
> **Status:** ✅ Active

This document defines the standard pattern for implementing edit pages with forms and tabs in the application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Core Components](#core-components)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### The Standard Pattern

```
Page Component
    ↓ (provides id, tenantId)
View Component
    ↓ (uses hooks)
useEntityEditForm Hook → EditPageContainer
    ↓                        ↓
  Form Logic            Tab Components
```

### Separation of Concerns

| Layer | Responsibility | Examples |
|-------|---------------|----------|
| **Page** | Route params, tenant context | `AdminLandingEditPage`, `MerchantLandingEditPage` |
| **View** | Composition, layout config | `LandingEditPageView`, `LotteriesEditPageView` |
| **Hook** | Form state, data fetching, submission | `useLandingEditForm`, `useLotteryEditForm` |
| **Container** | Common layout, tabs, actions | `EditPageContainer` |
| **Tabs** | Form fields rendering | `LandingSettingsTab`, `LotteriesGiftsTab` |

---

## Quick Start

### 1. Create the Edit Form Hook

```tsx
// /features/yourEntity/hooks/useYourEntityEditForm.ts
import { useEditPageForm } from "@/hooks/useEditPageForm";
import { useReadableError } from "@/lib/useReadableError";

export function useYourEntityEditForm(id: string, merchantId?: string) {
  const readableError = useReadableError();

  return useEditPageForm({
    id,
    useItemQuery: useYourEntityItem,
    useUpdateMutation: useUpdateYourEntity,
    schema: yourEntitySchema,

    entityToFormValues: (entity) => ({
      name: entity?.name ?? "",
      status: entity?.status ?? "draft",
      // ... map all fields
    }),

    formValuesToPayload: (values) => values,

    defaultValues: {
      name: "",
      status: "draft",
      // ... all required fields
    },

    successMessage: "Entity updated successfully",
    errorMessage: "Failed to update entity",
    readableError,
  });
}
```

### 2. Create the View Component

```tsx
// /features/yourEntity/components/YourEntityEditPageView.tsx
import { EditPageContainer } from "@/shared/ui/EditPageContainer";
import { useYourEntityEditForm } from "../hooks/useYourEntityEditForm";

export function YourEntityEditPageView({ id, merchantId }: { id: string; merchantId?: string }) {
  const router = useRouter();
  const t = useTranslations("yourEntity");

  const { form, entity, isReady, isSubmitting, onSubmit, onReset } =
    useYourEntityEditForm(id, merchantId);

  return (
    <EditPageContainer
      title={t("title")}
      description={t("description")}
      onBack={() => router.back()}
      form={form}
      tabs={[
        {
          id: "settings",
          label: t("tabs.settings"),
          error: (errors) => Boolean(errors.name || errors.status),
        },
        {
          id: "advanced",
          label: t("tabs.advanced"),
          error: (errors) => Boolean(errors.config),
        },
      ]}
      defaultTab="settings"
      onPrimary={onSubmit}
      onSecondary={onReset}
      isSubmitting={isSubmitting}
      isLoading={!isReady}
      loadingContent={<div>Loading...</div>}
    >
      {(activeTab) => (
        <>
          {activeTab === "settings" && (
            <YourEntitySettingsTab disabled={isSubmitting} />
          )}
          {activeTab === "advanced" && (
            <YourEntityAdvancedTab disabled={isSubmitting} />
          )}
        </>
      )}
    </EditPageContainer>
  );
}
```

### 3. Create the Page Component

```tsx
// /app/[local]/admin/yourEntity/[id]/edit/page.tsx
import { use } from "react";
import { YourEntityEditPageView } from "@/features/yourEntity/components/YourEntityEditPageView";

export default function AdminYourEntityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <YourEntityEditPageView id={id} />;
}
```

---

## Core Components

### `useEditPageForm` Hook

Generic hook that handles all common edit form logic.

**Type Signature:**
```tsx
function useEditPageForm<TFormValues, TEntity, TPayload>(options: {
  id: string;
  useItemQuery: (id: string) => UseQueryResult<TEntity>;
  useUpdateMutation: () => { execute: (payload) => void; isExecuting: boolean };
  schema: ZodSchema<TFormValues>;
  entityToFormValues: (entity: TEntity | null) => TFormValues;
  formValuesToPayload: (values: TFormValues, entity?: TEntity | null) => TPayload;
  defaultValues: TFormValues;
  successMessage?: string;
  errorMessage?: string;
  readableError?: (error: unknown, fallback?: string) => string;
  onSuccess?: () => void;
  waitForDeps?: boolean;
}): {
  form: UseFormReturn<TFormValues>;
  entity: TEntity | null;
  isReady: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (e?: BaseSyntheticEvent) => void;
  onReset: () => void;
  resetFromEntity: () => void;
  setIsHydrated: Dispatch<SetStateAction<boolean>>;
}
```

**Key Features:**
- ✅ Automatic form hydration when entity loads
- ✅ Handles form reset and submission
- ✅ Toast notifications on success/error
- ✅ Zod validation
- ✅ TypeScript generic support

---

### `EditPageContainer` Component

Reusable container that provides consistent layout for all edit pages.

**Props:**
```tsx
type EditPageContainerProps<TFieldValues, TTab> = {
  // Page metadata
  title: string;
  description?: string;
  onBack: () => void;

  // Form
  form: UseFormReturn<TFieldValues>;

  // Tabs
  tabs: TabDefinition<TTab, TFieldValues>[];
  defaultTab?: TTab;

  // Header actions (optional)
  headerActions?: SinglePageHeaderProps["actions"];

  // Footer actions
  primaryLabel?: string;        // default: "Save Changes"
  secondaryLabel?: string;       // default: "Reset"
  primaryDisabled?: boolean;     // default: !isDirty || isSubmitting
  secondaryDisabled?: boolean;   // default: isSubmitting
  onPrimary: () => void;
  onSecondary?: () => void;
  isSubmitting?: boolean;

  // Content
  children: (activeTab: TTab) => ReactNode;
  loadingContent?: ReactNode;
  isLoading?: boolean;
  formErrorMessage?: string;
};
```

**Features:**
- ✅ Sticky header with back button
- ✅ Tab navigation with error indicators
- ✅ Sticky footer with save/reset buttons
- ✅ Automatic form provider
- ✅ Loading state handling

---

## Step-by-Step Implementation

### Step 1: Define Your Schema

```tsx
// /features/yourEntity/model/yourEntitySchema.ts
import { z } from "zod";

export const yourEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["draft", "active", "archived"]),
  config: z.object({
    // ... nested fields
  }).optional(),
});

export type YourEntityFormValues = z.infer<typeof yourEntitySchema>;
```

### Step 2: Create Query/Mutation Hooks

```tsx
// /features/yourEntity/hooks/useYourEntityCrud.ts
export function useYourEntityItem(id: string) {
  return useQuery({
    queryKey: ["yourEntity", id],
    queryFn: () => fetchYourEntity(id),
  });
}

export function useUpdateYourEntity(opts?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  return useMutation({
    mutationFn: (payload) => updateYourEntity(payload),
    onSuccess: opts?.onSuccess,
    onError: opts?.onError,
  });
}
```

### Step 3: Create the Edit Form Hook

See [Quick Start](#quick-start) section above.

### Step 4: Create Tab Components

```tsx
// /features/yourEntity/components/YourEntitySettingsTab.tsx
import { RHFInput } from "@/components/form/controls";

export function YourEntitySettingsTab({ disabled }: { disabled?: boolean }) {
  return (
    <div className="space-y-4">
      <RHFInput
        name="name"
        label="Name"
        placeholder="Enter name"
        requiredStar
        disabled={disabled}
      />

      <RHFSelect
        name="status"
        label="Status"
        options={[
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
        disabled={disabled}
      />
    </div>
  );
}
```

### Step 5: Create the View Component

See [Quick Start](#quick-start) section above.

### Step 6: Create Page Components

Create both admin and merchant versions:

```tsx
// Admin version
export default function AdminYourEntityEditPage({ params }) {
  const { id } = use(params);
  return <YourEntityEditPageView id={id} merchantId={null} />;
}

// Merchant version
export default function MerchantYourEntityEditPage({ params }) {
  const { id } = use(params);
  const merchantId = useActiveTenantId();
  return <YourEntityEditPageView id={id} merchantId={merchantId} />;
}
```

---

## Best Practices

### 1. Form Field Components

**✅ DO: Use RHFCombobox for async data**
```tsx
<RHFCombobox<LiteListe>
  name="themeId"
  options={themesLite}
  getOptionValue={(o) => o.value}
  getOptionLabel={(o) => o.label}
  loading={themesLoading}
  keyBy={`theme-${merchantId}`}  // Forces remount when merchant changes
  valueIsNullable  // For optional fields
/>
```

**❌ DON'T: Use RHFSelect for async data**
```tsx
// ❌ This will have issues with edit mode default values
<RHFSelect
  name="themeId"
  options={themesLite}  // Async data - won't show default value!
/>
```

**✅ DO: Use RHFSelect for static options**
```tsx
<RHFSelect
  name="status"
  options={[
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
  ]}
/>
```

### 2. Form Hydration

The `useEditPageForm` hook handles hydration automatically. If you need to wait for additional dependencies:

```tsx
const { form, setIsHydrated } = useYourEntityEditForm(id);

React.useEffect(() => {
  if (!criticalDataLoaded) return;
  setIsHydrated(true);  // Signal hydration can proceed
}, [criticalDataLoaded, setIsHydrated]);
```

### 3. Tab Error Detection

Be specific about which fields cause tab errors:

```tsx
tabs={[
  {
    id: "settings",
    label: "Settings",
    error: (errors) => Boolean(
      errors.name ||
      errors.status ||
      errors.merchantId
    ),
  },
  {
    id: "advanced",
    label: "Advanced",
    error: (errors) => Boolean(errors.config),
  },
]}
```

### 4. Loading States

Always provide loading content:

```tsx
<EditPageContainer
  isLoading={!isReady}
  loadingContent={
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  }
>
  {/* ... */}
</EditPageContainer>
```

### 5. Translations

Organize translations by feature:

```json
{
  "yourEntity": {
    "title": "Edit Entity",
    "description": "Manage your entity settings",
    "tabs": {
      "settings": "Settings",
      "advanced": "Advanced"
    },
    "form": {
      "name": "Name",
      "namePlaceholder": "Enter entity name"
    },
    "toasts": {
      "updated": "Entity updated successfully",
      "updateFailed": "Failed to update entity"
    }
  }
}
```

---

## Common Patterns

### Pattern 1: Dependent Fields

When one field depends on another (e.g., places depend on selected merchant):

```tsx
const selectedMerchantId = watch("merchantId");

const { data: placesLite = [] } = usePlacesLite(
  selectedMerchantId ? { merchantId: selectedMerchantId } : {}
);

<RHFCombobox
  name="placeId"
  options={placesLite}
  keyBy={`place-${selectedMerchantId}`}  // Reset when merchant changes
  disabled={!selectedMerchantId}
/>
```

### Pattern 2: Conditional Tabs

Show/hide tabs based on entity state:

```tsx
const tabs = React.useMemo(() => {
  const baseTabs = [
    { id: "settings", label: "Settings" },
  ];

  if (entity?.isPremium) {
    baseTabs.push({ id: "premium", label: "Premium Features" });
  }

  return baseTabs;
}, [entity?.isPremium]);

<EditPageContainer tabs={tabs}>
  {/* ... */}
</EditPageContainer>
```

### Pattern 3: Custom Header Actions

Add publish, preview, or other actions:

```tsx
const headerActions = React.useMemo(() => [
  {
    icon: <Eye className="h-4 w-4" />,
    label: "Preview",
    onClick: () => window.open(previewUrl, "_blank"),
  },
  {
    icon: <Upload className="h-4 w-4" />,
    label: "Publish",
    onClick: handlePublish,
    variant: "default" as const,
  },
], [previewUrl, handlePublish]);

<EditPageContainer headerActions={headerActions}>
  {/* ... */}
</EditPageContainer>
```

### Pattern 4: Nested Field Arrays

For dynamic lists (like lottery gifts):

```tsx
import { useFieldArray } from "react-hook-form";

export function GiftsTab() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "gifts",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border p-4">
          <RHFInput name={`gifts.${index}.name`} label="Gift Name" />
          <Button onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ name: "", weight: 1 })}>
        Add Gift
      </Button>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Default values not showing on edit

**Cause:** Using `RHFSelect` with async options

**Solution:** Use `RHFCombobox` instead:
```tsx
// ❌ Bad
<RHFSelect name="themeId" options={asyncThemes} />

// ✅ Good
<RHFCombobox
  name="themeId"
  options={asyncThemes}
  getOptionValue={(o) => o.value}
  getOptionLabel={(o) => o.label}
  keyBy={`theme-${dependencyId}`}
/>
```

### Issue: Form not hydrating

**Cause:** `waitForDeps` is true but `setIsHydrated` never called

**Solution:** Signal when dependencies are ready:
```tsx
const { setIsHydrated } = useYourEntityEditForm(id);

React.useEffect(() => {
  if (allDepsLoaded) setIsHydrated(true);
}, [allDepsLoaded, setIsHydrated]);
```

### Issue: Tab errors not showing

**Cause:** Error detection function doesn't check all fields

**Solution:** List all fields explicitly:
```tsx
{
  id: "settings",
  label: "Settings",
  error: (errors) => Boolean(
    errors.field1 || errors.field2 || errors.field3
  ),
}
```

### Issue: TypeScript errors with form types

**Cause:** Generic type mismatch

**Solution:** Explicitly type your form values:
```tsx
export function useYourEntityEditForm(id: string) {
  return useEditPageForm<YourEntityFormValues, YourEntity, Partial<YourEntityFormValues>>({
    // ... options
  });
}
```

---

## Migration Checklist

Migrating an existing edit page? Follow this checklist:

- [ ] Extract form logic to `useEntityEditForm` hook
- [ ] Replace view component with `EditPageContainer`
- [ ] Update page components to pass only `id` and `tenantId`
- [ ] Convert async RHFSelect to RHFCombobox
- [ ] Add `keyBy` props to dependent fields
- [ ] Update tab error detection
- [ ] Add loading states
- [ ] Test form hydration
- [ ] Test save/reset functionality
- [ ] Test validation errors
- [ ] Update tests (if any)

---

## Examples

### Complete Examples

- **Simple:** `/features/lotteries` - Basic edit page with 2 tabs
- **Advanced:** `/features/landings` - Complex page with publish/unpublish actions
- **Nested Fields:** Lottery gifts (field arrays)

---

## Support

For questions or issues:
1. Check this guide first
2. Review existing examples
3. Check `/docs/REVIEW_edit_pages.md` for architectural details
4. Ask in #frontend-architecture channel

---

**Last Updated:** 2025-12-14
**Maintainer:** Development Team
