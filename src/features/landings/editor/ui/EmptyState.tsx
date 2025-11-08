"use client";

import { useTranslations } from "next-intl";

export function EmptyState() {
  const t = useTranslations("landings.editor");
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {t("emptyState")}
    </div>
  );
}
