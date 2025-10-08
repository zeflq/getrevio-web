// ui/form/SheetForm.tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
} from "react-hook-form";
import * as React from "react";

type SheetFormProps<TFieldValues extends FieldValues = FieldValues> = {
  open: boolean;
  title: string;
  description?: string;
  methods: UseFormReturn<TFieldValues>;
  onOpenChange: (o: boolean) => void;
  onSubmit: SubmitHandler<TFieldValues>;
  isBusy?: boolean;          // loading or mutating
  isReady?: boolean;         // gating
  children: React.ReactNode; // the fields
  onCancel?: () => void;
};

export function SheetForm<TFieldValues extends FieldValues = FieldValues>({
  open,
  title,
  description,
  methods,
  onOpenChange,
  onSubmit,
  isBusy,
  isReady = true,
  children,
  onCancel,
}: SheetFormProps<TFieldValues>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {!isReady ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 p-4">
              {children}
              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onCancel?.();
                    onOpenChange(false);
                  }}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isBusy}>
                  {isBusy ? "Saving..." : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          </FormProvider>
        )}
      </SheetContent>
    </Sheet>
  );
}
