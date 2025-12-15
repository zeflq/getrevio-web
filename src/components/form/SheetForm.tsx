// ui/form/SheetForm.tsx
/**
 * SheetForm - Reusable sheet dialog for forms with consistent UI/UX
 *
 * IMPORTANT: Understanding `skipFormProvider`
 *
 * This component wraps form content in FormProvider by default, which is correct
 * for standalone sheets that create their own form (e.g., from listing tables).
 *
 * However, if this sheet is used WITHIN an edit page that already has a FormProvider,
 * and you're passing the PARENT form via useFormContext(), you MUST use skipFormProvider={true}
 * to avoid nested FormProviders with the same form instance (causes race conditions).
 *
 * Rules:
 * - Sheet creates its own form with useForm() → skipFormProvider: false (default) ✅
 * - Sheet uses parent form with useFormContext() → skipFormProvider: true ✅
 *
 * See: /docs/SheetForm-usage-guide.md for detailed examples
 */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
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
  trigger?: React.ReactNode;
  /**
   * Skip wrapping in FormProvider.
   * Set to true when this sheet uses a parent form via useFormContext().
   * Default: false (creates its own FormProvider)
   */
  skipFormProvider?: boolean;
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
  trigger,
  skipFormProvider = false,
}: SheetFormProps<TFieldValues>) {
  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        methods.handleSubmit(onSubmit)(e);
      }}
      className="space-y-4 p-4"
    >
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
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="sm:max-w-[560px] w-full gap-0">
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
        ) : skipFormProvider ? (
          formContent
        ) : (
          <FormProvider {...methods}>{formContent}</FormProvider>
        )}
      </SheetContent>
    </Sheet>
  );
}
