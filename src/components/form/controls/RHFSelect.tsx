"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { value: string; label: string; disabled?: boolean };

type RHFSelectProps = {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  className?: string;
  labelClassName?: string;
  hideLabel?: boolean;
  onValueChange?: (value: string | undefined) => void;
  allowClear?: boolean; // optional "None" choice
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
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={cn(hideLabel && "sr-only", labelClassName)}>
            {label} {requiredStar ? <span className="text-destructive">*</span> : null}
          </FormLabel>

          <FormControl className="w-full">
            <Select
              value={(field.value as string | undefined) ?? undefined} // ← never ""
              onValueChange={(val) => {
                const next = val === CLEAR_SENTINEL ? undefined : val;
                field.onChange(next);
                onValueChange?.(next);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent>
                {allowClear && (
                  <SelectItem value={CLEAR_SENTINEL}>{clearLabel}</SelectItem>
                )}
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
