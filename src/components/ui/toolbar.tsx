"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b bg-background px-4 py-2",
        className
      )}
      {...props}
    />
  );
}

export function ToolbarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "ghost" | "default";
  size?: "sm" | "md";
}

export function ToolbarButton({
  asChild,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ToolbarButtonProps) {
  const Comp = asChild ? Slot : "button";
  const sizeCls = size === "sm" ? "h-8 px-2 text-sm" : "h-9 px-3";
  const varCls = variant === "ghost"
    ? "hover:bg-accent hover:text-accent-foreground"
    : "bg-primary text-primary-foreground hover:bg-primary/90";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-transparent transition disabled:opacity-50 disabled:pointer-events-none",
        sizeCls,
        varCls,
        className
      )}
      {...props}
    />
  );
}

export function ToolbarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="separator" aria-orientation="vertical" className={cn("mx-1 h-6 w-px bg-border", className)} {...props} />
  );
}

