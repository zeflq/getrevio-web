"use client";

import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LandingFormValues } from "../../model/landingSchema";

interface SimpleHeroInspectorProps {
  index: number;
  disabled?: boolean;
  onConvert?: () => void;
}

export function SimpleHeroInspector({ index, disabled, onConvert }: SimpleHeroInspectorProps) {
  const form = useFormContext<LandingFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`content.blocks.${index}.title` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Welcome to our landing" disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`content.blocks.${index}.subtitle` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtitle</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Short supporting copy" disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="button" variant="outline" disabled={disabled} onClick={onConvert}>
        Convert to Hero with CTA
      </Button>
    </div>
  );
}
