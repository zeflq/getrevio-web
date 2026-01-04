# API Error Handling Guide for New Modules

This guide shows you how to implement proper error handling in new features using our established patterns.

---

## 🎯 Quick Start

For most cases, you just need:

```typescript
import { http } from '@/shared/lib/http';
import { extractApiError } from '@/lib/api/errorHandler';
import { useErrorTranslation } from '@/hooks/useErrorTranslation';
```

---

## 🧭 Understanding Error Handling Layers

**We use a dual-layer approach:**

### Layer 1: Global Error Handling (Safety Net) 🛡️
- **Location**: `src/shared/lib/react-query.tsx`
- **What it does**: Automatically catches ALL React Query errors and shows toast notifications
- **When it triggers**: Any uncaught error from mutations/queries
- **Best for**: Background operations, quick actions, delete confirmations

### Layer 2: Component-Level Error Handling (Custom UI) 🎨
- **Location**: Individual hooks/components
- **What it does**: Provides explicit error state for custom error UI
- **When to use**: Forms with inline errors, create/edit dialogs, validation feedback
- **Best for**: User input, complex forms, multi-step flows

### 🤔 When to Use Which?

| Scenario | Use Global (Toast) | Use Component-Level | Use Both |
|----------|-------------------|---------------------|----------|
| Delete confirmation | ✅ | | |
| Quick action button | ✅ | | |
| Background sync | ✅ | | |
| Create/Edit form | | ✅ | |
| Multi-step wizard | | ✅ | |
| Form with validation | | ✅ | |
| Inline field errors | | | ✅ |

### 🔄 How They Work Together

```typescript
// Global catches errors → Shows toast
// Component handles errors → Shows inline UI
// Both can coexist without duplication!

try {
  await mutation.mutateAsync(data);
  // Success
} catch (error) {
  // Global: toast.error() triggered automatically
  // Component: You can ALSO set form error state
  const apiError = extractApiError(error);
  form.setError('root', { message: translateError(apiError.code) });
}
```

**Key insight**: Global toast is a fallback. If you handle errors explicitly in your component, both will show. This is usually fine - toast for quick feedback, inline error for context.

---

## 📋 Table of Contents

1. [Understanding Error Handling Layers](#-understanding-error-handling-layers)
2. [Pattern 1: Custom Hook (Component-Level)](#pattern-1-custom-hook-component-level)
3. [Pattern 2: React Query (Global + Optional Component-Level)](#pattern-2-react-query-global--optional-component-level)
4. [Pattern 3: Server Actions](#pattern-3-server-actions)
5. [Pattern 4: Form Integration (Both Layers)](#pattern-4-form-integration-both-layers)
6. [Global Error Handling](#global-error-handling)
7. [Best Practices](#best-practices)

---

## Pattern 1: Custom Hook (Component-Level)

**Error Layer**: Component-Level (custom error state)
**Use for**: Simple API calls, onboarding flows, standalone operations where you want custom error UI

**Why this pattern**:
- ✅ Full control over error display
- ✅ Can show errors inline in forms/dialogs
- ✅ Custom error state management

```typescript
// features/places/hooks/useCreatePlace.ts
"use client";

import { useState } from "react";
import { http } from "@/shared/lib/http";
import { extractApiError } from "@/lib/api/errorHandler";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";

interface CreatePlaceRequest {
  localName: string;
  address: string;
  merchantId: string;
}

interface CreatePlaceResponse {
  id: string;
  localName: string;
  address: string;
}

export function useCreatePlace() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { translateError } = useErrorTranslation();

  const createPlace = async (data: CreatePlaceRequest): Promise<CreatePlaceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Use shared HTTP client
      const result = await http.post<CreatePlaceResponse>(
        "/api/v1/places",
        data
      );

      return result;
    } catch (err) {
      // ✅ Extract and translate error
      const apiError = extractApiError(err);
      const translatedMessage = translateError(apiError.code);

      setError(translatedMessage);
      throw new Error(translatedMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPlace,
    isLoading,
    error,
  };
}
```

**Usage in Component:**

```typescript
// components/CreatePlaceDialog.tsx
"use client";

import { useCreatePlace } from "../hooks/useCreatePlace";

export function CreatePlaceDialog() {
  const { createPlace, isLoading, error } = useCreatePlace();

  const handleSubmit = async (data) => {
    try {
      await createPlace(data);
      // Success! Dialog closes or shows success message
    } catch (err) {
      // Error already set in hook state
      // Display error in UI
    }
  };

  return (
    <Dialog>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}

        {/* ✅ Show translated error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </form>
    </Dialog>
  );
}
```

---

## Pattern 2: React Query (Global + Optional Component-Level)

**Error Layer**: Global (automatic toast) + Optional Component-Level
**Use for**: CRUD operations, data mutations with cache invalidation

**Why this pattern**:
- ✅ Global error handling already configured (automatic toast)
- ✅ Can add custom `onError` if you need component-level handling
- ✅ Automatic cache invalidation
- ⚠️ Note: If you don't add `onError`, global handler shows toast automatically

```typescript
// features/places/hooks/usePlaceMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { toast } from "sonner";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";
import { extractApiError } from "@/lib/api/errorHandler";

interface CreatePlaceRequest {
  localName: string;
  address: string;
  merchantId: string;
}

export function useCreatePlaceMutation() {
  const queryClient = useQueryClient();
  const { translateError } = useErrorTranslation();

  return useMutation({
    mutationFn: async (data: CreatePlaceRequest) => {
      // ✅ Use shared HTTP client
      return http.post("/api/v1/places", data);
    },

    onSuccess: (data) => {
      // ✅ Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ["places"] });

      // ✅ Show success toast
      toast.success("Location created successfully");
    },

    onError: (error) => {
      // ✅ Extract and translate error
      const apiError = extractApiError(error);
      const translatedMessage = translateError(apiError.code);

      // ✅ Show error toast (automatically handled globally, but you can override)
      toast.error(translatedMessage);
    },
  });
}

export function useUpdatePlaceMutation() {
  const queryClient = useQueryClient();
  const { translateError } = useErrorTranslation();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreatePlaceRequest>) => {
      return http.patch(`/api/v1/places/${id}`, data);
    },

    onSuccess: (data, variables) => {
      // ✅ Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["places", variables.id] });

      toast.success("Location updated successfully");
    },

    onError: (error) => {
      const apiError = extractApiError(error);
      toast.error(translateError(apiError.code));
    },
  });
}

export function useDeletePlaceMutation() {
  const queryClient = useQueryClient();
  const { translateError } = useErrorTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      return http.delete(`/api/v1/places/${id}`);
    },

    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.removeQueries({ queryKey: ["places", id] });

      toast.success("Location deleted successfully");
    },

    onError: (error) => {
      const apiError = extractApiError(error);
      toast.error(translateError(apiError.code));
    },
  });
}
```

**Usage in Component:**

```typescript
"use client";

import { useCreatePlaceMutation } from "../hooks/usePlaceMutations";

export function CreatePlaceDialog() {
  const { mutateAsync: createPlace, isPending } = useCreatePlaceMutation();

  const handleSubmit = async (data) => {
    try {
      await createPlace(data);
      // ✅ Success toast shown automatically
      // ✅ Queries invalidated automatically
      onClose();
    } catch (error) {
      // ✅ Error toast shown automatically
      // You can add additional error handling here if needed
    }
  };

  return (
    <Dialog>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Dialog>
  );
}
```

---

## Pattern 3: Server Actions

**Use for**: Form submissions, server-side operations

```typescript
// app/places/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPlaceAction(data: {
  localName: string;
  address: string;
  merchantId: string;
}) {
  try {
    const response = await fetch(`${process.env.API_URL}/api/v1/places`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // ✅ Return error with code for client translation
      return {
        success: false,
        error: {
          code: errorData.code || "UNKNOWN_ERROR",
          message: errorData.message || "Failed to create place",
        },
      };
    }

    const result = await response.json();
    revalidatePath("/places");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      },
    };
  }
}
```

**Usage in Client Component:**

```typescript
"use client";

import { createPlaceAction } from "./actions";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";
import { toast } from "sonner";

export function CreatePlaceForm() {
  const { translateError } = useErrorTranslation();

  const handleSubmit = async (data) => {
    const result = await createPlaceAction(data);

    if (!result.success) {
      // ✅ Translate error code
      const translatedMessage = translateError(result.error.code);
      toast.error(translatedMessage);
      return;
    }

    toast.success("Location created successfully");
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## Pattern 4: Form Integration (Both Layers)

**Error Layer**: Both Global (toast) + Component-Level (form errors)
**Use for**: React Hook Form with field-specific errors

**Why this pattern**:
- ✅ Toast shows immediately for quick feedback
- ✅ Form errors show next to specific fields
- ✅ Best user experience - both quick notification and detailed guidance
- 💡 Both layers working together!

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { extractApiError } from "@/lib/api/errorHandler";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";
import { ErrorCodes } from "@/lib/errors";
import { useCreatePlaceMutation } from "../hooks/usePlaceMutations";

const placeSchema = z.object({
  localName: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  merchantId: z.string(),
});

type PlaceFormData = z.infer<typeof placeSchema>;

export function CreatePlaceForm() {
  const { mutateAsync: createPlace } = useCreatePlaceMutation();
  const { translateError } = useErrorTranslation();

  const form = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      localName: "",
      address: "",
      merchantId: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createPlace(data);
      form.reset();
    } catch (error) {
      const apiError = extractApiError(error);

      // ✅ Map specific error codes to form fields
      const errorFieldMap: Record<string, keyof PlaceFormData> = {
        [ErrorCodes.PLACE_ALREADY_EXISTS]: "localName",
        [ErrorCodes.INVALID_INPUT]: "root",
        [ErrorCodes.MERCHANT_NOT_FOUND]: "merchantId",
      };

      const field = errorFieldMap[apiError.code] || "root";
      const translatedMessage = translateError(apiError.code);

      // ✅ Set field-specific error
      form.setError(field, {
        type: "manual",
        message: translatedMessage,
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="localName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ Show root error */}
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create Location
        </Button>
      </form>
    </Form>
  );
}
```

---

## Global Error Handling

### Already Configured ✅

The project already has **global error handling** in `src/shared/lib/react-query.tsx`:

```typescript
// This is ALREADY set up in your project
const [client] = useState(() => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(readableError(error, 'generic'));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(readableError(error, 'generic'));
      },
    }),
  });
});
```

**What this means:**
- ✅ All React Query errors automatically show toast notifications
- ✅ Error codes are automatically translated (via `useReadableError`)
- ✅ You don't need to add `onError` to every mutation (it's optional)
- ✅ Acts as a **safety net** - no error goes unnoticed

### How It Works

The `useReadableError` hook:
1. Checks if error has a `code` field → Translates it from `messages/{locale}.json`
2. Falls back to generic error message if code not found
3. Never exposes technical details to users

**This works perfectly with our error handling system!** ✅

---

## 🎯 Choosing Your Approach

### Simple Approach: Let Global Handle Everything

**Best for**: Delete actions, quick mutations, background operations

```typescript
// ✅ Simplest - No onError needed!
export function useDeletePlaceMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      return http.delete(`/api/v1/places/${id}`);
    },
    // Global handler will show toast automatically
    // No onError needed!
  });
}

// Component
function DeleteButton({ placeId }) {
  const { mutate } = useDeletePlaceMutation();

  return (
    <Button onClick={() => mutate(placeId)}>
      Delete
    </Button>
  );
  // ✅ Error toast appears automatically if delete fails
}
```

### Custom Approach: Component-Level Error State

**Best for**: Forms, create/edit dialogs, complex UI

```typescript
// ✅ Custom error handling with state
export function useCreatePlace() {
  const [error, setError] = useState<string | null>(null);
  const { translateError } = useErrorTranslation();

  const createPlace = async (data) => {
    try {
      return await http.post("/api/v1/places", data);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(translateError(apiError.code));
      throw err;
    }
  };

  return { createPlace, error };
}

// Component
function CreatePlaceDialog() {
  const { createPlace, error } = useCreatePlace();

  return (
    <Dialog>
      {/* Custom error display */}
      {error && <Alert variant="destructive">{error}</Alert>}
      <Button onClick={handleCreate}>Create</Button>
    </Dialog>
  );
}
```

### Hybrid Approach: Both Layers

**Best for**: Forms with field-specific errors

```typescript
// ✅ Both global toast AND form errors
function CreatePlaceForm() {
  const { mutateAsync } = useCreatePlaceMutation(); // Has onError for toast
  const form = useForm();

  const onSubmit = async (data) => {
    try {
      await mutateAsync(data);
    } catch (error) {
      // Global: Toast shown automatically ✅
      // Component: ALSO set form error for inline display ✅
      const apiError = extractApiError(error);
      form.setError('root', {
        message: translateError(apiError.code)
      });
    }
  };

  return (
    <Form>
      {/* Toast notification (global) */}
      {/* Inline error (component-level) */}
      {form.formState.errors.root && <Alert>{form.formState.errors.root.message}</Alert>}
    </Form>
  );
}
```

---

## 🚫 Preventing Duplicate Toasts (If Needed)

If you want to handle errors ONLY at component-level (no toast), you can catch and not re-throw:

```typescript
// Option 1: Catch without re-throwing (no toast)
try {
  await mutateAsync(data);
} catch (error) {
  const apiError = extractApiError(error);
  setError(translateError(apiError.code));
  // ✅ Don't re-throw - global handler won't fire
  return; // Exit early
}

// Option 2: Use custom hook instead of React Query (no global handler)
const { createPlace, error } = useCreatePlace(); // Custom hook, not React Query
```

**However**, in most cases, having both toast + inline error is actually a **better UX**:
- Toast: Quick, dismissible feedback
- Inline error: Persistent, contextual guidance

**Recommendation**: Don't worry about duplication - embrace both! 🎉

---

## Best Practices

### 🎯 Error Handling Approach

1. **Understand the two layers**
   ```typescript
   // Layer 1: Global (automatic, always active)
   // - Configured in react-query.tsx
   // - Shows toast for ALL React Query errors
   // - Safety net - errors never go silent

   // Layer 2: Component-Level (optional, explicit)
   // - You add this when you need custom error UI
   // - Form errors, inline validation, etc.
   // - More control over error display
   ```

2. **Choose the right approach for your use case**
   ```typescript
   // ✅ Simple delete action - Let global handle it
   const { mutate } = useDeleteMutation();
   // No onError needed!

   // ✅ Create form - Use component-level for inline errors
   const { createPlace, error } = useCreatePlace();
   {error && <Alert>{error}</Alert>}

   // ✅ Complex form - Use both layers
   const { mutateAsync } = useCreateMutation(); // Global toast
   form.setError('field', { message }); // Component error
   ```

3. **Don't fear duplication - it's a feature!**
   ```typescript
   // ✅ This is GOOD UX:
   // - Toast: Quick dismissible notification
   // - Inline error: Persistent contextual help
   // Both work together beautifully!
   ```

### ✅ DO

1. **Always use the shared HTTP client**
   ```typescript
   import { http } from '@/shared/lib/http';

   // ✅ Good
   await http.post('/api/v1/places', data);

   // ❌ Avoid
   await fetch('/api/v1/places', { method: 'POST', body: JSON.stringify(data) });
   ```

2. **Always extract and translate errors**
   ```typescript
   import { extractApiError } from '@/lib/api/errorHandler';
   import { useErrorTranslation } from '@/hooks/useErrorTranslation';

   // ✅ Good
   const apiError = extractApiError(error);
   const message = translateError(apiError.code);

   // ❌ Avoid
   const message = error.message; // Not user-friendly, not translated
   ```

3. **Use specific error codes when relevant**
   ```typescript
   import { ErrorCodes, isErrorCode } from '@/lib/errors';

   // ✅ Good - Handle specific error
   if (isErrorCode(error, ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS)) {
     form.setError('email', { message: translateError(ErrorCodes.MERCHANT_EMAIL_ALREADY_EXISTS) });
   }
   ```

4. **Invalidate queries after mutations**
   ```typescript
   onSuccess: () => {
     // ✅ Good - Invalidate to refetch
     queryClient.invalidateQueries({ queryKey: ['places'] });
   }
   ```

5. **Show user-friendly messages**
   ```typescript
   // ✅ Good
   toast.success("Location created successfully");

   // ❌ Avoid technical messages
   toast.success("POST /api/v1/places returned 201");
   ```

### ❌ DON'T

1. **Don't hardcode error messages**
   ```typescript
   // ❌ Bad - Not translated, not consistent
   throw new Error("User not found");

   // ✅ Good - Uses error codes + translation
   const message = translateError(ErrorCodes.USER_NOT_FOUND);
   ```

2. **Don't expose technical details**
   ```typescript
   // ❌ Bad
   toast.error(`API error: ${error.stack}`);

   // ✅ Good
   const apiError = extractApiError(error);
   toast.error(translateError(apiError.code));
   ```

3. **Don't forget to handle loading states**
   ```typescript
   // ❌ Bad - No loading state
   <Button type="submit">Submit</Button>

   // ✅ Good
   <Button type="submit" disabled={isLoading}>
     {isLoading ? "Submitting..." : "Submit"}
   </Button>
   ```

4. **Don't swallow errors silently**
   ```typescript
   // ❌ Bad
   try {
     await createPlace(data);
   } catch (error) {
     // Silent failure - user doesn't know what happened
   }

   // ✅ Good
   try {
     await createPlace(data);
   } catch (error) {
     const apiError = extractApiError(error);
     toast.error(translateError(apiError.code));
   }
   ```

---

## Quick Reference Checklist

When adding API calls to a new module:

- [ ] Import `http` from `@/shared/lib/http`
- [ ] Import `extractApiError` from `@/lib/api/errorHandler`
- [ ] Import `useErrorTranslation` from `@/hooks/useErrorTranslation`
- [ ] Use `http.post()`, `http.get()`, `http.patch()`, or `http.delete()`
- [ ] Wrap in try/catch
- [ ] Extract error with `extractApiError(error)`
- [ ] Translate with `translateError(apiError.code)`
- [ ] Show error to user (toast, form error, or state)
- [ ] Handle loading states
- [ ] Invalidate queries if mutation
- [ ] Test error scenarios (duplicate, not found, unauthorized, etc.)

---

## Examples by Feature

### Places Feature
✅ See: `src/features/onboarding/hooks/useCompleteOnboarding.ts`

### Future Features (Template)

```typescript
// features/{feature}/hooks/use{Feature}Mutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { toast } from "sonner";
import { useErrorTranslation } from "@/hooks/useErrorTranslation";
import { extractApiError } from "@/lib/api/errorHandler";

export function useCreate{Feature}Mutation() {
  const queryClient = useQueryClient();
  const { translateError } = useErrorTranslation();

  return useMutation({
    mutationFn: async (data) => {
      return http.post("/api/v1/{features}", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{features}"] });
      toast.success("{Feature} created successfully");
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      toast.error(translateError(apiError.code));
    },
  });
}
```

---

## Need Help?

- 📖 See `ERROR_HANDLING_I18N.md` for detailed implementation guide
- 📄 See `IMPLEMENTATION_SUMMARY.md` for overview
- 💡 Check `src/features/onboarding/hooks/useCompleteOnboarding.ts` for reference implementation
- 🔍 Look at `src/shared/lib/http.ts` to understand HTTP client capabilities

---

## 📝 Summary: Dual-Layer Error Handling

### What You Get Out of the Box:
1. **Global Safety Net**: All React Query errors automatically show toast notifications
2. **Automatic Translation**: Error codes from backend are automatically translated to user-friendly messages
3. **Flexibility**: Choose global-only, component-only, or both based on your needs

### Quick Decision Guide:

```
Is it a form with validation?
└─ YES → Use Pattern 4 (Both Layers)
└─ NO
   └─ Is it a quick action (delete, sync)?
      └─ YES → Use Pattern 2 (Global Only)
      └─ NO → Is it a create/edit dialog?
         └─ YES → Use Pattern 1 (Component-Level)
         └─ NO → Use Pattern 2 (Global as default)
```

### Remember:
- ✅ Global error handling is ALREADY working
- ✅ Error codes are ALREADY translated
- ✅ You just need to use `http` client and error utilities
- ✅ Both layers can coexist - embrace it!

---

**You're all set! Error handling is already working globally via React Query. Just use the shared HTTP client and error utilities.** 🎉
