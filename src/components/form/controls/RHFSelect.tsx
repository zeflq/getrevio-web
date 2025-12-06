"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type RHFSelectProps = {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  className?: string;
  labelClassName?: string;
  hideLabel?: boolean;
  onValueChange?: (value: string | undefined) => void;
  /**
   * If true, adds a "clear" option at the top that sets the value to `undefined`.
   * This avoids using "" which Radix Select does not allow as an item value.
   */
  allowClear?: boolean;
  clearLabel?: string;
};

const CLEAR_SENTINEL = "__CLEAR__";

export function RHFSelect({
  name,
  label,
  options,
  placeholder = "Select…",
  description,
  disabled,
  requiredStar,
  className,
  labelClassName,
  hideLabel,
  onValueChange,
  allowClear = false,
  clearLabel = "None",
}: RHFSelectProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Normalize value for Radix: never pass "" or null
        const currentValue =
          field.value === "" || field.value == null
            ? undefined
            : (field.value as string | undefined);

        return (
          <FormItem className={className}>
            <FormLabel className={cn(hideLabel && "sr-only", labelClassName)}>
              {label}
              {requiredStar ? (
                <span className="ml-0.5 text-destructive">*</span>
              ) : null}
            </FormLabel>

            <FormControl className="w-full">
              <Select
                value={currentValue}
                disabled={disabled}
                onValueChange={(val) => {
                  const next = val === CLEAR_SENTINEL ? undefined : val;
                  field.onChange(next);
                  onValueChange?.(next);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                  {allowClear && (
                    <SelectItem value={CLEAR_SENTINEL}>{clearLabel}</SelectItem>
                  )}

                  {options.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      disabled={o.disabled}
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
}

export default RHFSelect;