"use client";

import { usePathname } from "@/i18n/navigation";
import { BreadcrumbTrail } from "@/components/ui/breadcrumb-trail";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const adminIndex = parts.indexOf("admin");
  const base = adminIndex >= 0 ? `/${parts.slice(0, adminIndex + 1).join("/")}` : "/admin";
  const stripBase = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const segments = stripBase.split("/").filter(Boolean);

  const labelMap: Record<string, string> = {
    admin: "Admin",
    merchants: "Merchants",
    places: "Places",
    campaigns: "Campaigns",
    shortlinks: "Shortlinks",
    events: "Events",
    stats: "Stats",
  };

  const toLabel = (s: string) =>
    labelMap[s] || s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const trailLinks = segments.slice(0, -1).map((seg, i) => ({
    label: toLabel(seg),
    href: `${base}/${segments.slice(0, i + 1).join("/")}`,
  }));
  const pageLabel = segments.length ? toLabel(segments[segments.length - 1]) : "Dashboard";

  return (
    <BreadcrumbTrail baseHref={base} trailLinks={trailLinks} pageLabel={pageLabel} />
  );
}