"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export interface IconAction {
  onClick: () => void;
  icon: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  ariaLabel: string; // required for a11y + default mobile label
  /** Optional desktop text label (keeps icons-only when omitted) */
  label?: string;
  /** Optional tooltip text (falls back to ariaLabel if not provided) */
  tooltip?: string;
  /** Show a loading state (spinner + disabled) */
  loading?: boolean;
}

type IconActionGroupProps = {
  actions: IconAction[];
  /** Extra classes for the desktop actions wrapper */
  className?: string;
  /** Label shown at top of the mobile menu */
  mobileMenuLabel?: string;
  /** Pass 'condensed' from your toolbar to reduce heights */
  condensed?: boolean;
  /** Customize the trigger button on mobile (defaults to MoreHorizontal icon) */
  mobileTrigger?: React.ReactNode;
  /** Force display mode: 'auto' (default, responsive), 'desktop', or 'mobile' */
  displayMode?: "auto" | "desktop" | "mobile";
};

export function IconActionGroup({
  actions,
  className,
  mobileMenuLabel,
  condensed,
  mobileTrigger,
  displayMode = "auto",
}: IconActionGroupProps) {
  if (!actions?.length) return null;

  const iconBtnClasses = condensed ? "h-8 w-8" : "h-9 w-9";
  const labeledBtnClasses = condensed ? "h-8 px-2 text-sm" : "h-9 px-3";

  // small inline spinner for loading state
  const Spinner = () => (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );

  // Render a single action as a button (desktop)
  const renderButton = (action: IconAction, key: string) => {
    const hasLabel = Boolean(action.label);
    const isLoading = Boolean(action.loading);
    const title = action.tooltip ?? action.ariaLabel;

    return (
      <Button
        key={key}
        variant={action.variant ?? "ghost"}
        disabled={action.disabled || isLoading}
        aria-label={action.ariaLabel ?? action.label ?? action.tooltip ?? "Action"}
        title={title}
        size={hasLabel ? "default" : "icon"}
        className={cn(hasLabel ? labeledBtnClasses : iconBtnClasses)}
        onClick={action.onClick}
      >
        <span className="inline-flex items-center gap-2">
          {isLoading ? <Spinner /> : action.icon}
          {hasLabel && <span className="whitespace-nowrap">{action.label}</span>}
        </span>
      </Button>
    );
  };

  // Render a single dropdown menu item (mobile)
  const renderMenuItem = (action: IconAction, key: string) => {
    const isLoading = Boolean(action.loading);

    return (
      <DropdownMenuItem
        key={key}
        disabled={action.disabled || isLoading}
        onSelect={(e) => {
          e.preventDefault();
          if (!action.disabled && !isLoading) action.onClick();
        }}
        className="cursor-pointer"
      >
        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
          {isLoading ? <Spinner /> : action.icon}
        </span>
        {/* Prefer explicit label, then tooltip, then ariaLabel */}
        <span>{action.label ?? action.tooltip ?? action.ariaLabel}</span>
      </DropdownMenuItem>
    );
  };

  // Factorized mobile menu rendering
  const renderMobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Open actions"
          className={iconBtnClasses}
        >
          {mobileTrigger ?? <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {mobileMenuLabel && (
          <>
            <DropdownMenuLabel>{mobileMenuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {actions.map((action, idx) =>
          renderMenuItem(action, `${action.ariaLabel}-${idx}`)
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (displayMode === "desktop") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {actions.map((action, idx) =>
          renderButton(action, `${action.ariaLabel}-${idx}`)
        )}
      </div>
    );
  }

  if (displayMode === "mobile") {
    return renderMobileMenu();
  }

  // auto (responsive)
  return (
    <>
      <div className={cn("hidden md:flex flex-wrap items-center gap-2", className)}>
        {actions.map((action, idx) =>
          renderButton(action, `${action.ariaLabel}-${idx}`)
        )}
      </div>
      <div className="md:hidden">{renderMobileMenu()}</div>
    </>
  );
}

/**
 * Backward-compatible exports (so you don't have to rename everywhere).
 * You can remove these once you've migrated usages.
 */
export type iconAction = IconAction;
export type iconActionGroupProps = IconActionGroupProps;
export const iconActionGroup = IconActionGroup;
