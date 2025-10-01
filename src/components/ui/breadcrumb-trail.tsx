"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type TrailLink = { href: string; label: string };

type BreadcrumbTrailProps = {
  baseHref: string;
  baseLabel?: string;
  trailLinks: TrailLink[];
  pageLabel: string;
  className?: string;
};

export function BreadcrumbTrail({
  baseHref,
  baseLabel = "Admin",
  trailLinks,
  pageLabel,
}: BreadcrumbTrailProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={baseHref}>{baseLabel}</BreadcrumbLink>
        </BreadcrumbItem>
        {trailLinks.map((item, idx) => (
          <React.Fragment key={`trail-${idx}`}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbTrail;