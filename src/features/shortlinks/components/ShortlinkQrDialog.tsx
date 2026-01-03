"use client";

import * as React from "react";
import Image from "next/image";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShortlinkQrDialogProps = {
  open: boolean;
  code: string | null;
  shortUrl?: string | null;
  onOpenChange: (open: boolean) => void;
  className?: string;
};

export function ShortlinkQrDialog({
  open,
  code,
  shortUrl,
  onOpenChange,
  className,
}: ShortlinkQrDialogProps) {
  const href = code ? `/api/qr/${encodeURIComponent(code)}` : null;
  const [loading, setLoading] = React.useState(Boolean(href));

  React.useEffect(() => {
    setLoading(Boolean(href));
  }, [href]);
  const handleLoad = React.useCallback(() => setLoading(false), []);

  const handleCopy = React.useCallback(async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
    } catch {
      // ignore copy errors
    }
  }, [shortUrl]);

  const handlePrint = React.useCallback(() => {
    if (!href) return;
    const win = window.open(href, "_blank", "noopener,noreferrer");
    if (!win) return;
    win.focus();
  }, [href]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-sm", className)}>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative flex h-64 w-64 items-center justify-center">
            {loading && (
              <div className="absolute flex h-full w-full items-center justify-center rounded border border-dashed border-muted-foreground/50">
                <span className="text-sm text-muted-foreground">Generating QR…</span>
              </div>
            )}
            {href ? (
              <Image
                src={href}
                alt={`QR code for ${code ?? ""}`}
                width={256}
                height={256}
                unoptimized
                onLoad={handleLoad}
                className={loading ? "opacity-0" : "opacity-100 transition-opacity"}
              />
            ) : (
              <div className="h-full w-full rounded border border-dashed border-muted-foreground/50" />
            )}
          </div>
          {code && <p className="text-sm text-muted-foreground">Code: {code}</p>}
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={handleCopy}
              disabled={!shortUrl}
              className="flex-1"
              variant="default"
            >
              Copy Short URL
            </Button>
            <Button type="button" onClick={handlePrint} disabled={!href} className="flex-1" variant="secondary">
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
