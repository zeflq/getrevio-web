"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type TrailLink = { href: string; label: string };

type BreadcrumbTrailProps = {
  baseHref: string;
  baseLabel?: string;
  trailLinks: TrailLink[];
  pageLabel: string;
  className?: string;
  /** Optional: override back behavior on mobile */
  backHref?: string;
  onBack?: () => void;
};

export function BreadcrumbTrail({
  baseHref,
  baseLabel = "Admin",
  trailLinks,
  pageLabel,
  className,
  backHref,
  onBack,
}: BreadcrumbTrailProps) {
  const router = useRouter();
  const doBack = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  };

  return (
    <div className={className}>
      {/* Mobile: Back + current page */}
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={doBack}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium truncate">{pageLabel}</span>
      </div>

      {/* Desktop: full breadcrumb trail */}
      <div className="hidden md:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={baseHref}>{baseLabel}</BreadcrumbLink>
            </BreadcrumbItem>

            {trailLinks.map((item, idx) => (
              <React.Fragment key={`trail-${idx}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

export default BreadcrumbTrail;
