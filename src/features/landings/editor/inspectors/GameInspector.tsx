"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LandingBelongsTo, LandingFormValues } from "../../model/landingSchema";

interface GameInspectorProps {
  index: number;
  disabled?: boolean;
  contextLabel?: string;
  belongsTo?: LandingBelongsTo;
}

export function GameInspector({ index, disabled, contextLabel, belongsTo }: GameInspectorProps) {
  const form = useFormContext<LandingFormValues>();
  const contextDescription = belongsTo?.type === "campaign" ? "Campaign" : "Place";

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Linked {contextDescription}</p>
        <p>{contextLabel ?? "This landing will attach to the selected entity."}</p>
      </div>

      <FormField
        control={form.control}
        name={`content.blocks.${index}.ctaLabel` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CTA label (optional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Play now" disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
