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

type RHFTextAreaProps = {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  rows?: number;
  className?: string;
  textareaProps?: Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "name" | "disabled" | "placeholder">
};

export function RHFTextArea({
  name,
  label,
  placeholder,
  description,
  disabled,
  requiredStar,
  rows = 5,
  className,
  textareaProps,
}: RHFTextAreaProps) {
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
            <textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
              {...textareaProps}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
