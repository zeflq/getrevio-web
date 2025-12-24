"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, MoreHorizontal, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface EditorCardProps {
  /** Collapse state */
  selected: boolean;
  onSelect: () => void;

  /** Reorder actions */
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;

  /** Dropdown actions */
  canDuplicate?: boolean;
  canDelete?: boolean;
  onDuplicate: () => void;
  onDelete: () => void;

  /** UI conditions */
  isFixed?: boolean;
  hasErrors?: boolean;
  disabled?: boolean;

  /** Header & content slots */
  header: React.ReactNode;
  content: React.ReactNode;
}

export function EditorCard({
  selected,
  onSelect,

  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,

  canDuplicate = true,
  canDelete = true,
  onDuplicate,
  onDelete,

  isFixed,
  hasErrors,
  disabled,

  header,
  content,
}: EditorCardProps) {
  const baseClasses = cn(
    "border rounded-lg cursor-pointer transition text-left shadow-md hover:bg-muted/60",
    "flex items-stretch",
    disabled && "opacity-60",
    isFixed && "border-l-4 border-primary/70",
    hasErrors && "border-destructive/70 bg-destructive/5 text-destructive"
  );

  return (
    <Collapsible open={selected} onOpenChange={onSelect} className="rounded-lg border shadow-xs">
      <CollapsibleTrigger asChild>
        <div className={baseClasses}>
          {/* Left reorder rail – DESKTOP ONLY */}
          {canMoveUp || canMoveDown && (
          <div
            className="hidden sm:flex flex-col justify-center gap-1 px-2 bg-muted/40 border-r border-border/50 rounded-l-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-7 w-7"
              disabled={!canMoveUp || disabled}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
            >
              <ArrowUp className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-7 w-7"
              disabled={!canMoveDown || disabled}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>)}

          {/* Header content */}
          <div className="flex-1 flex items-center justify-between px-2 py-2">
            {/* LEFT SLOT */}
            <div className="flex items-center gap-2">{header}</div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2">
              {(canDuplicate || canDelete || canMoveUp || canMoveDown) && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    {/* Reorder entries (utile surtout en mobile) */}
                    <DropdownMenuItem
                      disabled={!canMoveUp || disabled}
                      onSelect={(e) => {
                        e.preventDefault();
                        onMoveUp();
                      }}
                    >
                      Monter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!canMoveDown || disabled}
                      onSelect={(e) => {
                        e.preventDefault();
                        onMoveDown();
                      }}
                    >
                      Descendre
                    </DropdownMenuItem>

                    {canDuplicate && (
                      <DropdownMenuItem
                        disabled={disabled}
                        onSelect={(e) => {
                          e.preventDefault();
                          onDuplicate();
                        }}
                      >
                        Dupliquer
                      </DropdownMenuItem>
                    )}

                    {canDelete && (
                      <DropdownMenuItem
                        disabled={disabled}
                        onSelect={(e) => {
                          e.preventDefault();
                          onDelete();
                        }}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  selected ? "rotate-180" : "rotate-0"
                )}
              />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      {/* Animated expanded content */}
      <CollapsibleContent forceMount>
        <motion.div
          initial={false}
          animate={selected ? "open" : "collapsed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            collapsed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="space-y-4 px-4 py-3">{content}</div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
