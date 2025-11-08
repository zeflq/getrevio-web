"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { LandingFormValues } from "../../model/landingSchema";

interface LegalTextInspectorProps {
  index: number;
  disabled?: boolean;
}

export function LegalTextInspector({ index, disabled }: LegalTextInspectorProps) {
  const form = useFormContext<LandingFormValues>();

  return (
    <FormField
      control={form.control}
      name={`content.blocks.${index}.text` as const}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Legal text</FormLabel>
          <FormControl>
            <textarea
              {...field}
              className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Add legal or compliance language"
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
