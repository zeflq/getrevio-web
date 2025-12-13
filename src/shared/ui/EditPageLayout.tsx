"use client";

import * as React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SinglePageHeader, SinglePageHeaderProps } from "./SinglePageHeader";

type EditPageTab = {
  id: string;
  label: string;
  hasError?: boolean;
};

type EditPageLayoutProps = {
  title: string;
  description?: string;
  /** Back action (renders back button if provided) */
  onBack?: () => void;
  /** Icon actions (preview, publish, etc.) */
  headerActions?: SinglePageHeaderProps["actions"];
  /** Page-level tabs */
  tabs?: EditPageTab[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  /** Sticky footer actions */
  showFooter?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  onPrimary?: () => void;
  onSecondary?: () => void;
  isSaving?: boolean;
  /** Main page content */
  children: React.ReactNode;
  className?: string;
};

/**
 * Universal edit-page shell:
 * - sticky header with title + description + header actions
 * - optional page-level tabs under the header
 * - centered content column
 * - optional sticky footer with gradient fade
 */
export function EditPageLayout({
  title,
  description,
  onBack,
  headerActions,
  tabs,
  activeTabId,
  onTabChange,
  showFooter = false,
  primaryLabel,
  secondaryLabel,
  primaryDisabled,
  secondaryDisabled,
  onPrimary,
  onSecondary,
  isSaving,
  children,
  className,
}: EditPageLayoutProps) {
  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-6">
          <div className="flex flex-col gap-0">
            {/* Top row: back + title + actions */}
            <div className="flex items-center gap-2">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 h-8 w-8 rounded-full"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              <SinglePageHeader
                title={title}
                description={description}
                actions={headerActions ?? []}
                align="between"
                className="flex-1"
              />
            </div>

            {/* Tabs row */}
            {hasTabs && (
              <Tabs
                value={activeTabId}
                onValueChange={(value) => onTabChange?.(value)}
              >
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/80">
                  {tabs!.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "whitespace-nowrap text-sm transition-colors",
                        tab.hasError &&
                          "relative border-destructive/60 text-destructive data-[state=active]:border-destructive data-[state=active]:text-destructive",
                        tab.hasError &&
                          "before:absolute before:right-2 before:top-1/2 before:block before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:border before:border-destructive/60 before:bg-destructive before:opacity-90"
                      )}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div
          className={cn(
            "mx-auto w-full max-w-5xl px-2 py-4 md:px-6 md:py-12",
            showFooter && "pb-28" // room for sticky footer
          )}
        >
          {children}
        </div>
      </main>

      {/* STICKY FOOTER */}
      {showFooter && (primaryLabel || secondaryLabel) && (
        <footer className="sticky bottom-0 z-10 mt-auto border-t bg-background/95 py-3 backdrop-blur-sm">
          <div
            className="pointer-events-none absolute -top-8 left-0 h-8 w-full"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--background)), transparent)",
            }}
          />
          <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-3 sm:px-6">
            {secondaryLabel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSecondary}
                disabled={secondaryDisabled || isSaving}
              >
                {secondaryLabel}
              </Button>
            )}
            {primaryLabel && (
              <Button
                type="button"
                onClick={onPrimary}
                disabled={primaryDisabled || isSaving}
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {primaryLabel}
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
