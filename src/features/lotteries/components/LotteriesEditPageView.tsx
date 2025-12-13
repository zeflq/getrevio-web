"use client";

import * as React from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { EditPageLayout } from "@/shared/ui/EditPageLayout";
import {
  lotteryConfigUpdateSchema,
  type LotteryConfigFormValues,
} from "@/features/lotteries/model/lotterySchema";
import { useLotteryItem, useUpdateLottery } from "@/features/lotteries/hooks/useLotteryCrud";
import type { LiteListe } from "@/types/lists";
import { LotteriesSettingsTab } from "./LotteriesSettingsTab";
import { LotteriesGiftsTab } from "./LotteriesGiftsTab";
import { useTabbedFormState } from "@/hooks/useTabbedFormState";

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
  const { data: lottery, isLoading } = useLotteryItem(id);
  const { execute, isExecuting } = useUpdateLottery<
    LotteryConfigFormValues & { id: string },
    { ok?: true }
  >();

  const form = useForm<LotteryConfigFormValues>({
    resolver: zodResolver(lotteryConfigUpdateSchema.omit({ id: true })) as Resolver<
      LotteryConfigFormValues
    >,
    mode: "onChange",
    defaultValues: {
      merchantId: merchantId ?? "",
      name: "",
      enabled: "false",
      playLimitPerUser: 1,
      cooldown: "one_day",
      noWinWeight: 0,
      guaranteeWinOnFirstPlay: "false",
      gifts: [],
    },
  });
  
  const { reset, setValue } = form;
  const hasHydratedRef = React.useRef(false);
  React.useEffect(() => {
    if (!lottery) return;
    if (hasHydratedRef.current) return;
    reset({
      merchantId: merchantId ?? lottery.merchantId,
      name: lottery.name,
      enabled: lottery.enabled ? "true" : "false",
      playLimitPerUser: lottery.playLimitPerUser,
      cooldown: lottery.cooldown,
      noWinWeight: lottery.noWinWeight,
      guaranteeWinOnFirstPlay: lottery.guaranteeWinOnFirstPlay ? "true" : "false",
      gifts: lottery.gifts,
    });
    hasHydratedRef.current = true;
  }, [lottery, merchantId, reset]);

  React.useEffect(() => {
    if (merchantId) {
      setValue("merchantId", merchantId, { shouldValidate: true, shouldDirty: false });
    }
  }, [merchantId, setValue]);

  const resetForm = () =>
    reset({
      merchantId: merchantId ?? lottery?.merchantId ?? "",
      name: lottery?.name ?? "",
      enabled: lottery?.enabled ? "true" : "false",
      playLimitPerUser: lottery?.playLimitPerUser ?? 1,
      cooldown: lottery?.cooldown ?? "one_day",
      noWinWeight: lottery?.noWinWeight ?? 0,
      guaranteeWinOnFirstPlay: lottery?.guaranteeWinOnFirstPlay ? "true" : "false",
      gifts: lottery?.gifts ?? [],
    });

  const onSubmit = (values: LotteryConfigFormValues) => {
    execute({ id, ...values });
  };

  const isBusy = isLoading || isExecuting;
  const isReady = !!lottery && !isLoading;
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const handlePrimary = () => formRef.current?.requestSubmit();

  const tabState = useTabbedFormState({
    form,
    tabs: [
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
    ],
    defaultTab: "settings",
  });

  return (
    <EditPageLayout
      title={t("title")}
      description={t("description")}
      onBack={() => router.back()}
      tabs={tabState.tabs}
      activeTabId={tabState.activeTab}
      onTabChange={tabState.handleTabChange}
      showFooter
      primaryLabel={isExecuting ? t("saving") : t("actions.saveChanges")}
      primaryDisabled={isBusy || !form.formState.isDirty}
      secondaryLabel={t("actions.reset")}
      secondaryDisabled={isBusy}
      onPrimary={handlePrimary}
      onSecondary={resetForm}
    >
      {!isReady ? (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
          {t("loading")}
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {tabState.activeTab === "settings" && (
              <LotteriesSettingsTab
                disabled={isBusy}
                merchantId={merchantId}
                merchantsLite={merchantsLite}
              />
            )}

            {tabState.activeTab === "gifts" && <LotteriesGiftsTab />}
          </form>
        </FormProvider>
      )}
    </EditPageLayout>
  );
}
