"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CirclePlus, LayoutDashboard, PanelsTopLeft } from "lucide-react";

export function TabPreview() {
  return (
    <div className="rounded-full border border-border/90 bg-background/90 px-1 py-1 ">
      <div className="flex items-center gap-6 rounded-full border border-border/90 bg-background/90 px-6 py-3 text-[var(--landing-muted-text)]">
        <ArrowLeft className="h-5 w-5" aria-hidden />
        <ArrowRight className="h-5 w-5" aria-hidden />
        <CirclePlus className="h-5 w-5" aria-hidden />
        <LayoutDashboard className="h-5 w-5" aria-hidden />
        <PanelsTopLeft className="h-5 w-5 text-[var(--landing-primary)]" aria-hidden />
      </div>
    </div>
  );
}
