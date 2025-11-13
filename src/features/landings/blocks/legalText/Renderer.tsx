"use client";
import type { LegalTextData } from "./schema";

export function LegalTextRenderer({ data }: { data: LegalTextData }) {
  const snippet = data.text?.slice(0, 60);
  return <p className="text-sm text-muted-foreground">{snippet || "Legal copy"}</p>;
}
