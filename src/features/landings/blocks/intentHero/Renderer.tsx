"use client";
import { Button } from "@/components/ui/button";
import type { IntentHeroData } from "./schema";

export function IntentHeroRenderer({ data }: { data: IntentHeroData }) {
  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-foreground">{data.title || "Drumroll, please"}</p>
      {data.subtitle && <p className="text-sm text-muted-foreground">{data.subtitle}</p>}
      <Button variant="primaryOutline" size="default">
        {data.cta.label}
      </Button>
    </div>
  );
}
