"use client";

import { useFormContext, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type SelectOption = {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
};

type RHFSelectProps = {
  name: string;
  label?: string;
  options?: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  keyBy?: {
    value: string;
    label: string;
  };
  // Async options
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  // Additional features
  onValueChange?: (value: string) => void;
  parseValue?: (value: string) => unknown;
  searchable?: boolean;
};

export function RHFSelect({
  name,
  label,
  options = [],
  placeholder = "Select an option",
  description,
  disabled = false,
  requiredStar = false,
  className,
  labelClassName,
  triggerClassName,
  keyBy,
  isLoading = false,
  loadingText = "Loading...",
  emptyText = "No options available",
  onValueChange,
  parseValue,
  searchable = false,
}: RHFSelectProps) {
  const { control } = useFormContext();

  // Normalize options if keyBy is provided
  const normalizedOptions: SelectOption[] = keyBy
    ? options.map((option: any) => ({
        value: option[keyBy.value],
        label: option[keyBy.label],
        disabled: option.disabled,
      }))
    : options;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          {label && (
            <FormLabel className={cn(labelClassName)}>
              {label}
              {requiredStar && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <Select
            disabled={disabled || isLoading}
            onValueChange={(value) => {
              field.onChange(parseValue ? parseValue(value) : value);
              onValueChange?.(value);
            }}
            value={field.value?.toString()}
            defaultValue={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  "w-full",
                  !field.value && "text-muted-foreground",
                  triggerClassName
                )}
              >
                {isLoading ? (
                  <div className="flex justify-between items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{loadingText}</span>
                  </div>
                ) : (
                  <SelectValue placeholder={placeholder} />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {loadingText}
                </div>
              ) : normalizedOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                normalizedOptions.map((option) => (
                  <SelectItem
                    value={option.value.toString()}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <div className="text-xs min-h-[1.25rem]"><FormMessage /></div>
        </FormItem>
      )}
    />
  );
}
