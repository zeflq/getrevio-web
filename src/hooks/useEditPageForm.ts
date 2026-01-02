"use client";

import * as React from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ZodSchema } from "zod";
import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Generic hook for edit page forms following SOLID principles.
 *
 * @template TFormValues - The form data type (Zod inferred)
 * @template TEntity - The entity type from the API
 * @template TPayload - The payload type for updates
 *
 * @example
 * ```tsx
 * const editForm = useEditPageForm({
 *   id: landingId,
 *   useItemQuery: useLandingItem,
 *   useUpdateMutation: useUpdateLanding,
 *   schema: landingFormSchema,
 *   entityToFormValues: fillLandingFormFromEntity,
 *   formValuesToPayload: buildLandingPayload,
 *   defaultValues: createLandingFormDefaults(),
 *   successMessage: "Landing updated",
 * });
 * ```
 */
export function useEditPageForm<
  TFormValues extends Record<string, any>,
  TEntity = unknown,
  TPayload = Partial<TFormValues>
>(options: {
  /** The ID of the entity being edited */
  id: string;

  /** Query hook to fetch the entity */
  useItemQuery: (id: string) => UseQueryResult<TEntity>;

  /** Mutation hook to update the entity */
  useUpdateMutation: (opts?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    mutateAsync: (payload: any) => Promise<any>;
    isPending: boolean;
  };

  /** Zod schema for validation */
  schema: ZodSchema<TFormValues>;

  /** Convert entity to form values */
  entityToFormValues: (entity: TEntity | null) => TFormValues;

  /** Convert form values to update payload */
  formValuesToPayload: (values: TFormValues, entity?: TEntity | null) => TPayload;

  /** Default form values */
  defaultValues: TFormValues;

  /** Success toast message */
  successMessage?: string;

  /** Error toast fallback message */
  errorMessage?: string;

  /** Optional custom error handler */
  readableError?: (error: unknown, fallback?: string) => string;

  /** Optional callback after successful update */
  onSuccess?: () => void;

  /** Optional dependencies that must load before hydration */
  waitForDeps?: boolean;
}) {
  const {
    id,
    useItemQuery,
    useUpdateMutation,
    schema,
    entityToFormValues,
    formValuesToPayload,
    defaultValues,
    successMessage = "Updated successfully",
    errorMessage = "Update failed",
    readableError = (error: unknown, fallback = "An error occurred") =>
      error instanceof Error ? error.message : fallback,
    onSuccess: onSuccessCallback,
    waitForDeps = false,
  } = options;

  // Fetch entity
  const entityQuery = useItemQuery(id);
  const entity = entityQuery.data ?? null;

  // Form setup
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  // Hydration state
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Track if we should sync form after next entity update (after save)
  const shouldSyncRef = React.useRef(false);

  // Reset form from entity
  const resetFromEntity = React.useCallback(() => {
    if (!entity) return;
    form.reset(entityToFormValues(entity));
  }, [entity, form, entityToFormValues]);

  // Hydrate form when entity loads (initial load only)
  React.useEffect(() => {
    if (!entity || isHydrated) return;
    if (waitForDeps) return; // Wait for parent to signal ready

    form.reset(entityToFormValues(entity));
    setIsHydrated(true);
  }, [entity, form, entityToFormValues, isHydrated, waitForDeps]);

  // Sync form after save when fresh data arrives
  React.useEffect(() => {
    if (!shouldSyncRef.current || !entity || !isHydrated) return;

    // Don't sync if form has unsaved changes (e.g., user editing nested data like gifts)
    const isDirty = form.formState.isDirty;
    if (isDirty) {
      // Clear the flag without syncing - user has made new changes since save
      shouldSyncRef.current = false;
      return;
    }

    // Reset form with fresh server data
    form.reset(entityToFormValues(entity), {
      keepDirtyValues: false,
      keepErrors: false,
    });

    // Clear the flag
    shouldSyncRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, isHydrated]); // Only depend on entity and isHydrated - form.reset and entityToFormValues are stable

  // Update mutation
  const { mutateAsync, isPending } = useUpdateMutation({
    onSuccess: () => {
      toast.success(successMessage);
      // Clear dirty state immediately after a successful save.
      // This prevents isDirty from staying true while waiting for refetch.
      form.reset(form.getValues(), {
        keepValues: true,
        keepDirty: false,
        keepErrors: false,
        keepTouched: false,
      });
      // Set flag to sync form when fresh entity data arrives from refetch
      shouldSyncRef.current = true;
      onSuccessCallback?.();
    },
    onError: (error: unknown) => {
      toast.error(readableError(error, errorMessage));
    },
  });

  // Submit handler
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = formValuesToPayload(values, entity);
      await mutateAsync({ id, ...payload } as any);
    } catch (error) {
      toast.error(readableError(error, "Validation failed"));
    }
  });

  // Reset handler
  const onReset = React.useCallback(() => {
    if (entity) {
      resetFromEntity();
    } else {
      form.reset(defaultValues);
    }
  }, [entity, resetFromEntity, form, defaultValues]);

  // Derived state
  const isReady = !!entity && !entityQuery.isLoading && isHydrated;
  const isLoading = entityQuery.isLoading;

  return {
    form,
    entity,
    isReady,
    isLoading,
    isSubmitting: isPending,
    onSubmit,
    onReset,
    resetFromEntity,
    setIsHydrated, // Allow manual control if needed
  };
}

/**
 * Return type helper for useEditPageForm
 */
export type UseEditPageFormReturn<
  TFormValues extends Record<string, any>,
  TEntity = unknown
> = {
  form: UseFormReturn<TFormValues>;
  entity: TEntity | null;
  isReady: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  onReset: () => void;
  resetFromEntity: () => void;
  setIsHydrated: React.Dispatch<React.SetStateAction<boolean>>;
};
