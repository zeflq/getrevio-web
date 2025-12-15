"use client";

import * as React from "react";
import { FormProvider, type UseFormReturn, type FieldValues } from "react-hook-form";

import { EditPageLayout } from "./EditPageLayout";
import { useTabbedFormState } from "@/hooks/useTabbedFormState";
import type { SinglePageHeaderProps } from "./SinglePageHeader";

type TabDefinition<TTab extends string, TFieldValues extends FieldValues> = {
  id: TTab;
  label: string;
  error?: (errors: UseFormReturn<TFieldValues>["formState"]["errors"]) => boolean;
};

type EditPageContainerProps<
  TFieldValues extends FieldValues,
  TTab extends string
> = {
  /** Page title */
  title: string;

  /** Page description */
  description?: string;

  /** Back navigation handler */
  onBack: () => void;

  /** React Hook Form instance */
  form: UseFormReturn<TFieldValues, any, any>;

  /** Tab definitions */
  tabs: TabDefinition<TTab, TFieldValues>[];

  /** Default active tab */
  defaultTab?: TTab;

  /** Header actions (preview, publish, etc.) */
  headerActions?: SinglePageHeaderProps["actions"];

  /** Primary button label */
  primaryLabel?: string;

  /** Secondary button label */
  secondaryLabel?: string;

  /** Disable primary button */
  primaryDisabled?: boolean;

  /** Disable secondary button */
  secondaryDisabled?: boolean;

  /** Primary button click handler (usually form submit) */
  onPrimary: () => void;

  /** Secondary button click handler (usually reset) */
  onSecondary?: () => void;

  /** Show loading state */
  isSubmitting?: boolean;

  /** Form content - receives activeTab */
  children: (activeTab: TTab) => React.ReactNode;

  /** Loading state content */
  loadingContent?: React.ReactNode;

  /** Show loading state */
  isLoading?: boolean;

  /** Error message to show below form */
  formErrorMessage?: string;

  /** Additional className */
  className?: string;
};

/**
 * Reusable container for edit pages with tabs.
 * Handles common patterns: layout, tabs, form state, submit actions.
 *
 * @example
 * ```tsx
 * <EditPageContainer
 *   title="Edit Landing"
 *   form={form}
 *   tabs={[
 *     { id: "settings", label: "Settings", error: (e) => !!e.settings },
 *     { id: "content", label: "Content", error: (e) => !!e.content },
 *   ]}
 *   onBack={() => router.back()}
 *   onPrimary={handleSubmit}
 *   onSecondary={handleReset}
 * >
 *   {(activeTab) => (
 *     activeTab === "settings" ? <SettingsTab /> : <ContentTab />
 *   )}
 * </EditPageContainer>
 * ```
 */
export function EditPageContainer<
  TFieldValues extends FieldValues,
  TTab extends string
>({
  title,
  description,
  onBack,
  form,
  tabs,
  defaultTab,
  headerActions,
  primaryLabel = "Save Changes",
  secondaryLabel = "Reset",
  primaryDisabled,
  secondaryDisabled,
  onPrimary,
  onSecondary,
  isSubmitting = false,
  children,
  loadingContent,
  isLoading = false,
  formErrorMessage,
  className,
}: EditPageContainerProps<TFieldValues, TTab>) {
  const tabState = useTabbedFormState({
    form,
    tabs,
    defaultTab,
  });

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const handlePrimary = () => {
    formRef.current?.requestSubmit();
  };

  const isDirty = form.formState.isDirty;

  return (
    <EditPageLayout
      title={title}
      description={description}
      onBack={onBack}
      headerActions={headerActions}
      tabs={tabState.tabs}
      activeTabId={tabState.activeTab}
      onTabChange={tabState.handleTabChange}
      showFooter
      primaryLabel={primaryLabel}
      secondaryLabel={secondaryLabel}
      primaryDisabled={primaryDisabled ?? (!isDirty || isSubmitting)}
      secondaryDisabled={secondaryDisabled ?? isSubmitting}
      onPrimary={handlePrimary}
      onSecondary={onSecondary}
      isSaving={isSubmitting}
      className={className}
    >
      {isLoading && loadingContent ? (
        loadingContent
      ) : (
        <FormProvider {...form}>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              onPrimary();
            }}
            className="space-y-6"
            noValidate
          >
            {children(tabState.activeTab)}

            {tabState.hasFormErrors && (
              <p className="text-xs text-destructive/80">
                {formErrorMessage ?? "Please fix the errors above"}
              </p>
            )}
          </form>
        </FormProvider>
      )}
    </EditPageLayout>
  );
}
