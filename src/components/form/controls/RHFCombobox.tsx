"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { GenericCombobox } from "@/components/ui/genericCombobox";

type RHFComboboxProps<T> = {
  name: string;               // required
  label: string;              // required
  options: T[];               // required
  getOptionValue: (o: T) => string;
  getOptionLabel: (o: T) => string;
  valueIsNullable?: boolean;  // default false -> empty string
  placeholder?: string;
  searchPlaceholder?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  requiredStar?: boolean;
  className?: string;
  keyBy?: string | number;    // force reset when deps change (e.g. merchantId)
  buttonClassName?: string;
};

export function RHFCombobox<T>({
  name,
  label,
  options,
  getOptionValue,
  getOptionLabel,
  valueIsNullable = false,
  placeholder,
  searchPlaceholder,
  description,
  disabled,
  loading,
  requiredStar,
  className,
  keyBy,
  buttonClassName,
}: RHFComboboxProps<T>) {
  const { control } = useFormContext();

  return (
    <FormField
      key={keyBy ? String(keyBy) : undefined}
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {requiredStar ? <span className="text-destructive">*</span> : null}
          </FormLabel>
          <FormControl>
            <GenericCombobox<T>
              options={options}
              value={field.value ?? (valueIsNullable ? null : "")}
              onChange={(id) => field.onChange(valueIsNullable ? id ?? null : id ?? "")}
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              disabled={disabled}
              loading={loading}
              buttonClassName={buttonClassName}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
