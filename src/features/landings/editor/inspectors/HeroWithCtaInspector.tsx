"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LandingFormValues } from "../../model/landingSchema";

interface HeroWithCtaInspectorProps {
  index: number;
  disabled?: boolean;
}

export function HeroWithCtaInspector({ index, disabled }: HeroWithCtaInspectorProps) {
  const form = useFormContext<LandingFormValues>();
  const name = `content.blocks.${index}.ctas` as const;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`content.blocks.${index}.title` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Hero title" disabled={disabled} />
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
              <Input {...field} placeholder="Optional subtitle" disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">CTAs</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || fields.length >= 2}
            onClick={() =>
              append({ label: "", url: "", style: fields.length === 0 ? "primary" : "secondary" })
            }
          >
            <Plus className="h-4 w-4" /> Add CTA
          </Button>
        </div>

        {fields.map((fieldItem, ctaIndex) => (
          <div key={fieldItem.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              CTA #{ctaIndex + 1}
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  onClick={() => remove(ctaIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove CTA</span>
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name={`content.blocks.${index}.ctas.${ctaIndex}.label` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Primary CTA" disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`content.blocks.${index}.ctas.${ctaIndex}.url` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`content.blocks.${index}.ctas.${ctaIndex}.style` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
