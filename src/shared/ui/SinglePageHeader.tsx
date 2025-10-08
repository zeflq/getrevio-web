import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { iconAction, iconActionGroup as IconActionGroup } from "./IconActionGroup";

export interface SinglePageHeaderProps {
  title: string;
  description?: string;
  actions?: iconAction[];
  align?: "start" | "center" | "between";
  className?: string;
  isLoading?: boolean;
}

export function SinglePageHeader({
  title,
  description,
  actions = [],
  align = "between",
  className,
  isLoading = false,
}: SinglePageHeaderProps) {
  const justify =
    align === "start" ? "sm:justify-start" : align === "center" ? "sm:justify-center" : "sm:justify-between";

  // Skeleton state (mobile-first)
  if (isLoading) {
    return (
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${justify} ${className ?? ""}`}>
        <div className="space-y-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 justify-between ${justify} ${className ?? ""}`}>
      {/* Title and description */}
      <div className="space-y-1 flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Actions: icon-only buttons */}
      <IconActionGroup
        actions={actions}
        condensed
      />
    </div>
  );
}