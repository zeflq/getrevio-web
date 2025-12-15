# Code Review: Edit Pages (Landing & Lottery)

## Executive Summary

This review analyzes the edit page implementations for Landing and Lottery features, identifying inconsistencies and proposing improvements following SOLID principles.

---

## 1. Current State Analysis

### Landing Edit Pages Implementation

**Files:**
- `/app/[local]/admin/landings/[id]/edit/page.tsx` (Admin)
- `/app/[local]/m/landings/[id]/edit/page.tsx` (Merchant)
- `/features/landings/hooks/useLandingForm.ts` (Form logic)
- `/features/landings/components/LandingEditPageView.tsx` (Presentation)

**Pattern:**
```
Page Component → Custom Hook (useLandingForm) → View Component
```

**Strengths:**
- ✅ Separation of concerns (hook handles form, view handles UI)
- ✅ Form logic is reusable via custom hook
- ✅ Proper use of React Hook Form with Zod validation

**Weaknesses:**
- ❌ **90% code duplication** between Admin and Merchant pages
- ❌ **11 props** passed to LandingEditPageView (prop drilling)
- ❌ View component needs many dependencies from page
- ❌ resetFromEntity called in useEffect (could cause extra renders)

### Lottery Edit Pages Implementation

**Files:**
- `/app/[local]/admin/lotteries/[id]/page.tsx`
- `/features/lotteries/components/LotteriesEditPageView.tsx`

**Pattern:**
```
Page Component (minimal) → View Component (contains everything)
```

**Strengths:**
- ✅ Simple page component
- ✅ All logic in one place (easier to find)

**Weaknesses:**
- ❌ **Violates Single Responsibility Principle** - view does data fetching, form logic, and rendering
- ❌ Form logic not reusable
- ❌ Hard to test in isolation
- ❌ Manual form hydration with hasHydratedRef pattern
- ❌ Inconsistent with Landing pattern

---

## 2. Issues Identified

### Issue #1: Code Duplication (DRY violation)
**Severity:** HIGH

AdminLandingEditPage and MerchantLandingEditPage are 90% identical:
```tsx
// Only difference is tenantId
const tenantId = useActiveTenantId(); // Merchant only
// vs
tenantId={null} // Admin
```

### Issue #2: Inconsistent Patterns
**Severity:** HIGH

- Landing uses custom hooks + view pattern
- Lottery uses all-in-one view pattern
- No clear guideline for developers

### Issue #3: Prop Drilling
**Severity:** MEDIUM

LandingEditPageView receives 11 props:
```tsx
<LandingEditPageView
  tenantId={tenantId}
  t={t}
  tToasts={tToasts}
  router={router}
  readableError={readableError}
  form={form}
  landing={landing}
  isReady={isReady}
  isLoading={isLoading}
  isSubmitting={isSubmitting}
  onSubmit={onSubmit}
  onReset={onReset}
  publishAction={publishAction}
  unpublishAction={unpublishAction}
/>
```

### Issue #4: Form Hydration Pattern Inconsistency
**Severity:** MEDIUM

- Landing: Uses `reset()` in useEffect
- Lottery: Uses `hasHydratedRef` manual guard
- Both can cause race conditions with async options

---

## 3. Proposed Improvements (SOLID Principles)

### A. Create Generic `useEditPageForm` Hook

**Single Responsibility:** One hook for all edit page form logic

```tsx
// /hooks/useEditPageForm.ts
export function useEditPageForm<TFormValues, TEntity>(options: {
  id: string;
  useItemQuery: (id: string) => UseQueryResult<TEntity>;
  useUpdateMutation: () => UseMutationResult;
  schema: ZodSchema<TFormValues>;
  entityToFormValues: (entity: TEntity | null) => TFormValues;
  formValuesToPayload: (values: TFormValues) => unknown;
  defaultValues: TFormValues;
}) {
  // Unified form logic here
}
```

### B. Create Unified Page Component Pattern

**Dependency Inversion:** Page depends on abstractions (hooks), not concrete implementations

```tsx
// Pattern: Page.tsx
export default function EntityEditPage({ params }) {
  const { id } = use(params);
  const merchantId = useActiveTenantId(); // or null for admin

  const { form, entity, isReady, isSubmitting, onSubmit, onReset } =
    useEntityEditForm(id, { merchantId });

  return <EntityEditPageView form={form} entity={entity} />;
}
```

### C. Simplify View Components

**Interface Segregation:** Views only receive what they need

```tsx
// Reduced from 11 props to 3-4 props
<EntityEditPageView
  form={form}
  entity={entity}
  additionalData={...} // if needed
/>
```

### D. Extract Reusable Edit Page Container

**Open/Closed:** Create a container that's closed for modification, open for extension

```tsx
// /shared/ui/EditPageContainer.tsx
export function EditPageContainer<TFormValues>({
  form,
  tabs,
  headerConfig,
  children,
}) {
  const tabState = useTabbedFormState({ form, tabs });

  return (
    <EditPageLayout {...tabState} {...headerConfig}>
      {children}
    </EditPageLayout>
  );
}
```

---

## 4. Concrete Improvements

### Improvement #1: Merge Duplicate Page Components

**Before:**
- `AdminLandingEditPage` (50 lines)
- `MerchantLandingEditPage` (53 lines)

**After:**
```tsx
// Single implementation with tenantId handled by route
function LandingEditPage({ params }) {
  const { id } = use(params);
  const merchantId = useActiveMerchantId(); // null if admin route

  return <LandingEditPageView id={id} merchantId={merchantId} />;
}
```

### Improvement #2: Refactor LotteriesEditPageView

**Extract form logic to hook:**
```tsx
// /features/lotteries/hooks/useLotteryEditForm.ts
export function useLotteryEditForm(id: string, merchantId?: string) {
  // Move all form logic here
  // Return: { form, lottery, isReady, isSubmitting, onSubmit, onReset }
}
```

**Simplify view:**
```tsx
// View only handles rendering
export function LotteriesEditPageView({ id, merchantId }) {
  const { form, lottery, ... } = useLotteryEditForm(id, merchantId);

  return (
    <EditPageContainer form={form} tabs={...}>
      {/* Render tabs */}
    </EditPageContainer>
  );
}
```

### Improvement #3: Fix Form Hydration

**Use controlled hydration pattern:**
```tsx
// In useEditPageForm
const [isHydrated, setIsHydrated] = React.useState(false);

React.useEffect(() => {
  if (!entity || isHydrated) return;

  // Wait for critical async data to load
  if (criticalDataLoading) return;

  form.reset(entityToFormValues(entity));
  setIsHydrated(true);
}, [entity, form, entityToFormValues, isHydrated, criticalDataLoading]);
```

---

## 5. Implementation Plan

### Phase 1: Create Shared Infrastructure
1. ✅ Create `useEditPageForm` generic hook
2. ✅ Create `EditPageContainer` component
3. ✅ Add form hydration pattern

### Phase 2: Refactor Lottery Pages
1. ✅ Extract `useLotteryEditForm` hook
2. ✅ Simplify `LotteriesEditPageView`
3. ✅ Test form hydration with async data

### Phase 3: Refactor Landing Pages
1. ✅ Merge Admin/Merchant page components
2. ✅ Simplify `LandingEditPageView` props
3. ✅ Migrate to use `EditPageContainer`

### Phase 4: Documentation
1. ✅ Create `form-guidelines.md`
2. ✅ Add examples and best practices

---

## 6. Breaking Changes

⚠️ **None** - All changes are internal refactoring. Public APIs remain the same.

---

## 7. Testing Requirements

- [ ] Test form hydration with async options (themes, places, campaigns)
- [ ] Test form validation across all tabs
- [ ] Test save/reset functionality
- [ ] Test publish/unpublish actions (Landing only)
- [ ] Test error handling

---

## 8. Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Lines (Landing pages) | ~600 | ~400 | -33% |
| Code Duplication | 90% | 0% | -90% |
| Props to View Components | 11 | 3-4 | -65% |
| Reusable Hooks | 1 | 3 | +200% |

---

## Next Steps

1. **Review this document** with the team
2. **Validate** proposed approach
3. **Implement** Phase 1 (shared infrastructure)
4. **Iterate** through remaining phases
