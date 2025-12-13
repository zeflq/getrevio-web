"use client";

import * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

type TabDefinition<TTab extends string, TFieldValues extends FieldValues> = {
  id: TTab;
  label: string;
  error?: (errors: UseFormReturn<TFieldValues>["formState"]["errors"]) => boolean;
};

export function useTabbedFormState<TFieldValues extends FieldValues, TTab extends string>(
  args: {
    form: UseFormReturn<TFieldValues>;
    tabs: TabDefinition<TTab, TFieldValues>[];
    defaultTab?: TTab;
  }
) {
  const { form, tabs, defaultTab } = args;
  const [activeTab, setActiveTab] = React.useState<TTab>(
    () => defaultTab ?? tabs[0]?.id ?? ("" as TTab)
  );

  React.useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id ?? ("" as TTab));
    }
  }, [tabs, activeTab]);

  const tabsWithErrors = React.useMemo(() => {
    return tabs.map((tab) => ({
      id: tab.id,
      label: tab.label,
      hasError: tab.error ? tab.error(form.formState.errors) : false,
    }));
  }, [tabs, form.formState.errors]);

  const handleTabChange = (value: string) => {
    const found = tabs.find((tab) => tab.id === value);
    if (found) {
      setActiveTab(found.id);
    }
  };

  const hasFormErrors = tabsWithErrors.some((tab) => tab.hasError);

  return {
    activeTab,
    tabs: tabsWithErrors,
    handleTabChange,
    hasFormErrors,
  };
}
