"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type EditSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Section de réglages “pro” façon Stripe / Linear :
 * - card légère
 * - header discret
 * - padding resserré
 */
export function EditSection({
  title,
  description,
  children,
  className,
}: EditSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm",
        className
      )}
    >
      {(title || description) && (
        <header className="mb-3 space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-foreground/80">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground/80">
              {description}
            </p>
          )}
        </header>
      )}

      {children}
    </section>
  );
}
