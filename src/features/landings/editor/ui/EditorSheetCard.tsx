"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { SheetForm } from "@/components/form/SheetForm";

export interface EditorSheetCardProps {
  /** Titre clair du bloc, affiché dans la Sheet */
  sheetTitle: string;
  sheetDescription?: string;
  sheetContext?: React.ReactNode;

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

  /** UI state */
  isFixed?: boolean;
  hasErrors?: boolean;
  disabled?: boolean;

  /** Contenu visible dans la card (titre, badge, etc.) */
  header: React.ReactNode;

  /** Contenu du formulaire / config dans la Sheet */
  content: React.ReactNode;
}

export function EditorSheetCard({
  sheetTitle,
  sheetDescription,
  sheetContext,

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
}: EditorSheetCardProps) {
  const t = useTranslations("landings.editor.sheetCard");
  const [open, setOpen] = React.useState(false);
  const form = useFormContext();

  const handleMoveUp = () => {
    if (!disabled && canMoveUp) onMoveUp();
  };

  const handleMoveDown = () => {
    if (!disabled && canMoveDown) onMoveDown();
  };

  const handleDuplicate = () => {
    if (!disabled) onDuplicate();
  };

  const handleDelete = () => {
    if (!disabled) onDelete();
  };

  const triggerCard = (
    <div
      className={cn(
        "bg-background border rounded-lg px-3 py-2.5",
        "flex items-center justify-between gap-2",
        "cursor-pointer transition hover:bg-muted/60",
        disabled && "opacity-60 cursor-not-allowed",
        isFixed && "border-l-4 border-primary/70",
        hasErrors && "border-destructive/70 bg-destructive/5 text-destructive"
      )}
      onClick={() => {
        if (disabled) return;
        setOpen(true);
      }}
    >
      <div className="flex-1 flex items-center gap-2 truncate">{header}</div>
      {(canDuplicate || canDelete || canMoveUp || canMoveDown) && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "xs" }),
              "shrink-0"
            )}
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={!canMoveUp || disabled}
              onSelect={(e) => {
                e.preventDefault();
                handleMoveUp();
              }}
            >
              Monter
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canMoveDown || disabled}
              onSelect={(e) => {
                e.preventDefault();
                handleMoveDown();
              }}
            >
              Descendre
            </DropdownMenuItem>

            {canDuplicate && (
              <DropdownMenuItem
                disabled={disabled}
                onSelect={(e) => {
                  e.preventDefault();
                  handleDuplicate();
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
                  handleDelete();
                }}
              >
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const handleSubmit = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SheetForm
      open={open}
      title={sheetTitle}
      description={sheetDescription}
      methods={form}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      isBusy={form.formState.isSubmitting}
      isReady={!form.formState.isSubmitting}
      onCancel={() => setOpen(false)}
      trigger={triggerCard}
    >
      {sheetContext && (
        <p className="text-xs text-muted-foreground">{sheetContext}</p>
      )}
      <div className="space-y-4">{content}</div>
    </SheetForm>
  );
}
