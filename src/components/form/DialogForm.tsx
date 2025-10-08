// src/components/form/DialogForm.tsx
"use client";

import * as React from "react";
import { FormProvider, type UseFormReturn, FieldValues } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DialogFormProps<T extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  methods: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;

  /** Disable form & buttons */
  isBusy?: boolean;

  /** When false, show skeletons instead of children (e.g., loading item) */
  isReady?: boolean;

  /** Called on Cancel button */
  onCancel?: () => void;

  /** Provide custom footer; if omitted, a default Cancel/Submit is rendered */
  footer?: React.ReactNode;

  /** Submit button text (default: Save / Create based on context) */
  submitLabel?: string;

  /** Extra classes for content */
  className?: string;

  /** If you want to hide default footer completely */
  hideDefaultFooter?: boolean;
};

type UseFormReturnWithSlot<T extends FieldValues> = UseFormReturn<T> & {
  _slot?: React.ReactNode;
};

export function DialogForm<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  methods,
  onSubmit,
  isBusy,
  isReady = true,
  onCancel,
  footer,
  submitLabel = "Save",
  className,
  hideDefaultFooter,
}: DialogFormProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[500px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {!isReady ? (
              <div className="space-y-3 py-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              // Children are provided by the caller via composition
              (methods as UseFormReturnWithSlot<T>)._slot ?? null
            )}

            {footer ?? (
              !hideDefaultFooter && (
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onCancel?.();
                      onOpenChange(false);
                    }}
                    disabled={!!isBusy}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!!isBusy}>
                    {isBusy ? "Saving..." : submitLabel}
                  </Button>
                </DialogFooter>
              )
            )}
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Small helper to allow JSX children inside DialogForm while keeping RHF typing clean.
 * Usage:
 *   <DialogForm ...>{children}</DialogForm>
 */
DialogForm.Slot = function Slot({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};
