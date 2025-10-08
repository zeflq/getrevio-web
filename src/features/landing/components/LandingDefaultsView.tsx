"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LandingDefaultsViewProps = {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  className?: string;
};

export default function LandingDefaultsView({
  title,
  subtitle,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  className,
}: LandingDefaultsViewProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}

      {primaryCtaLabel && primaryCtaUrl && (
        <a
          href={primaryCtaUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline"
        >
          {primaryCtaLabel}
        </a>
      )}

      {secondaryCtaLabel && secondaryCtaUrl && (
        <a
          href={secondaryCtaUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline block"
        >
          {secondaryCtaLabel}
        </a>
      )}
    </div>
  );
}