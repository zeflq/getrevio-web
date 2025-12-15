"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { EditPageContainer } from "@/shared/ui/EditPageContainer";
import type { LiteListe } from "@/types/lists";
import { useLotteryEditForm } from "../hooks/useLotteryEditForm";
import { LotteriesSettingsTab } from "./LotteriesSettingsTab";
import { LotteriesGiftsTab } from "./LotteriesGiftsTab";

type LotteriesEditPageViewProps = {
  id: string;
  merchantId?: string;
  merchantsLite?: LiteListe[];
};

export function LotteriesEditPageView({
  id,
  merchantId,
  merchantsLite = [],
}: LotteriesEditPageViewProps) {
  const router = useRouter();
  const t = useTranslations("lotteries.editPage");

  const { form, lottery, isReady, isSubmitting, onSubmit, onReset } =
    useLotteryEditForm(id, merchantId);

  return (
    <EditPageContainer
      title={t("title")}
      description={t("description")}
      onBack={() => router.back()}
      form={form}
      tabs={[
        {
          id: "settings",
          label: t("tabs.settings"),
          error: (errors) =>
            Boolean(
              errors.merchantId ||
                errors.name ||
                errors.playLimitPerUser ||
                errors.cooldown ||
                errors.guaranteeWinOnFirstPlay ||
                errors.noWinWeight
            ),
        },
        {
          id: "gifts",
          label: t("tabs.gifts"),
          error: (errors) => Boolean(errors.gifts),
        },
      ]}
      defaultTab="settings"
      primaryLabel={isSubmitting ? t("saving") : t("actions.saveChanges")}
      secondaryLabel={t("actions.reset")}
      onPrimary={onSubmit}
      onSecondary={onReset}
      isSubmitting={isSubmitting}
      loadingContent={
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
          {t("loading")}
        </div>
      }
      isLoading={!isReady}
    >
      {(activeTab) => (
        <>
          {activeTab === "settings" && (
            <LotteriesSettingsTab
              disabled={isSubmitting}
              merchantId={merchantId}
              merchantsLite={merchantsLite}
            />
          )}

          {activeTab === "gifts" && <LotteriesGiftsTab />}
        </>
      )}
    </EditPageContainer>
  );
}
