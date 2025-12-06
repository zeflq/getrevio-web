"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

type BaseProps = {
  name: string; // required
  label: string; // required
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  className?: string;
  suffix?: React.ReactNode;
};

// All other input props (min, max, step, placeholder, type, etc.)
type InputExtraProps = Omit<
  React.ComponentProps<typeof Input>,
  "name" | "disabled" // we'll control those
>;

type RHFInputProps = BaseProps & InputExtraProps;

export function RHFInput({
  name,
  label,
  description,
  disabled,
  requiredStar,
  className,
  suffix,
  type = "text",
  ...inputProps
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
                disabled={disabled}
                // native props (min, max, step, placeholder, etc.)
                {...inputProps}
                // RHF wiring last so it keeps control of value/onChange
                {...field}
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