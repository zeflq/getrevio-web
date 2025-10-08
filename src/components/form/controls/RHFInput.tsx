"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";

type RHFInputProps = {
  name: string;                 // required
  label: string;                // required
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  inputProps?: Omit<React.ComponentProps<typeof Input>, "name" | "disabled" | "placeholder" | "type">;
  suffix?: React.ReactNode;     // optional: right-side adornment (icon, etc.)
};

export function RHFInput({
  name,
  label,
  placeholder,
  description,
  disabled,
  requiredStar,
  type = "text",
  className,
  inputProps,
  suffix,
}: RHFInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {requiredStar ? <span className="text-destructive">*</span> : null}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                {...inputProps}
              />
              {suffix ? (
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  {suffix}
                </span>
              ) : null}
            </div>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
