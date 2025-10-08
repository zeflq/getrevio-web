// src/components/ui/confirm-by-name-dialog.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // optional; remove if you don't have it

export type ConfirmByNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** What are we deleting/confirming? e.g. "Campaign" */
  title: string;

  /** Short sentence explaining the consequence */
  description?: string;

  /** The exact string the user must type to enable the confirm button */
  expectedName: string | undefined;

  /** Label to show before the bold expectedName */
  confirmPromptLabel?: string; // default: "Type"

  /** Placeholder for the input */
  inputPlaceholder?: string;

  /** Text on the confirm button */
  confirmLabel?: string; // default: "Confirm"

  /** Variant for the confirm button */
  confirmVariant?: "default" | "destructive" | "secondary" | "outline" | "ghost" | "link";

  /** Is the operation in-flight? */
  loading?: boolean;

  /** Called when the user presses the confirm button (already validated) */
  onConfirm: () => Promise<void> | void;

  /** Called when the user cancels / closes */
  onCancel?: () => void;

  /** When true, prevent closing the dialog while loading */
  preventCloseWhileLoading?: boolean;

  /** Optional extra footer content (left side) */
  footerLeft?: React.ReactNode;

  /** Optional className passthrough */
  className?: string;
};

export function ConfirmByNameDialog({
  open,
  onOpenChange,
  title,
  description = "This action cannot be undone.",
  expectedName,
  confirmPromptLabel = "Type",
  inputPlaceholder = "Enter the name to confirm",
  confirmLabel = "Confirm",
  confirmVariant = "destructive",
  loading = false,
  onConfirm,
  onCancel,
  preventCloseWhileLoading = true,
  footerLeft,
  className,
}: ConfirmByNameDialogProps) {
  const [value, setValue] = React.useState("");

  const isValid = expectedName != null && value === expectedName;

  const handleConfirm = async () => {
    if (!isValid || loading) return;
    await onConfirm();
    setValue("");
  };

  const handleOpenChange = (next: boolean) => {
    if (preventCloseWhileLoading && loading && !next) return; // block closing if loading
    if (!next) {
      setValue("");
      onCancel?.();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("sm:max-w-[500px]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="confirm-by-name">
              {confirmPromptLabel}{" "}
              <span className="font-semibold">{expectedName ?? "…"}</span> to confirm
            </Label>
            <Input
              id="confirm-by-name"
              placeholder={inputPlaceholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Confirm by typing entity name"
              autoFocus
              disabled={loading || !expectedName}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {footerLeft ?? null}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={!isValid || loading}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
