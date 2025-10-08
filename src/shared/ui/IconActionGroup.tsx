"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface iconAction {
  onClick: () => void;
  icon: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  disabled?: boolean;
  ariaLabel: string; // also used as the mobile label
}

type iconActionGroupProps = {
  actions: iconAction[];
  /** Extra classes for the desktop actions wrapper */
  className?: string;
  /** Label shown at top of the mobile menu */
  mobileMenuLabel?: string;
  /** Pass 'condensed' from your toolbar to reduce heights */
  condensed?: boolean;
  /** Customize the trigger button on mobile (defaults to MoreHorizontal icon) */
  mobileTrigger?: React.ReactNode;
  /** Force display mode: 'auto' (default, responsive), 'desktop', or 'mobile' */
  displayMode?: 'auto' | 'desktop' | 'mobile';
};

export function iconActionGroup({
  actions,
  className,
  mobileMenuLabel,
  condensed,
  mobileTrigger,
  displayMode = 'auto',
}: iconActionGroupProps) {
  if (!actions?.length) return null;

  const btnClasses = condensed ? "h-8 w-8" : "h-9 w-9";

  // Render a single icon button (desktop)
  const renderButton = (action: iconAction, key: string) => (
    <Button
      key={key}
      variant={action.variant ?? "ghost"}
      disabled={action.disabled}
      aria-label={action.ariaLabel}
      title={action.ariaLabel}
      size="icon"
      className={btnClasses}
      onClick={action.onClick}
    >
      <span className="inline-flex items-center">{action.icon}</span>
    </Button>
  );

  // Render a single dropdown menu item (mobile)
  const renderMenuItem = (action: iconAction, key: string) => (
    <DropdownMenuItem
      key={key}
      disabled={action.disabled}
      onSelect={(e) => {
        e.preventDefault();
        if (!action.disabled) action.onClick();
      }}
      className="cursor-pointer"
    >
      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
        {action.icon}
      </span>
      <span>{action.ariaLabel}</span>
    </DropdownMenuItem>
  );

  // Factorized mobile menu rendering
  const renderMobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Open actions"
          className={btnClasses}
        >
          {mobileTrigger ?? <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="">
        {mobileMenuLabel && (
          <>
            <DropdownMenuLabel>{mobileMenuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {actions.map((action, idx) => renderMenuItem(action, `${action.ariaLabel}-${idx}`))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (displayMode === 'desktop') {
    return (
      <div className={cn("flex flex-wrap items-center gap-0", className)}>
        {actions.map((action, idx) => renderButton(action, `${action.ariaLabel}-${idx}`))}
      </div>
    );
  }
  if (displayMode === 'mobile') {
    return renderMobileMenu();
  }
  // auto (responsive)
  return (
    <>
      <div className={cn("hidden md:flex flex-wrap items-center gap-0", className)}>
        {actions.map((action, idx) => renderButton(action, `${action.ariaLabel}-${idx}`))}
      </div>
      <div className="md:hidden">
        {renderMobileMenu()}
      </div>
    </>
  );
}
