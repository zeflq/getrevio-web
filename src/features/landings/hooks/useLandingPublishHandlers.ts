 "use client";

import * as React from "react";
import { toast } from "sonner";

import type { Landing } from "@/types/domain";
import type { LandingPublishAction } from "./usePublishAction";
import type { LandingUnpublishAction } from "./useUnpublishAction";

type PublishHandlersArgs = {
  landing: Landing | null;
  publishAction: LandingPublishAction;
  unpublishAction: LandingUnpublishAction;
  hasUnpublishedChanges: boolean;
  tToasts: ReturnType<typeof import("next-intl").useTranslations>;
  readableError: (error: unknown, key?: string) => string;
  router: ReturnType<typeof import("@/i18n/navigation").useRouter>;
};

export function useLandingPublishHandlers({
  landing,
  publishAction,
  unpublishAction,
  hasUnpublishedChanges,
  tToasts,
  readableError,
  router,
}: PublishHandlersArgs) {
  const isToggleLoading = publishAction.isPending || unpublishAction.isPending;

  const handlePublish = React.useCallback(async () => {
    if (!landing?.merchantId) return;
    try {
      await publishAction.mutateAsync({ id: landing.id, merchantId: landing.merchantId });
      toast.success(
        hasUnpublishedChanges ? tToasts("publishedChanges") : tToasts("published")
      );
      router.refresh();
    } catch (error) {
      toast.error(readableError(error, "generic"));
    }
  }, [landing, publishAction, hasUnpublishedChanges, tToasts, router, readableError]);

  const handleUnpublish = React.useCallback(async () => {
    if (!landing?.merchantId) return;
    try {
      await unpublishAction.mutateAsync({ id: landing.id, merchantId: landing.merchantId });
      toast.success(tToasts("unpublished"));
      router.refresh();
    } catch (error) {
      toast.error(readableError(error, "generic"));
    }
  }, [landing, unpublishAction, tToasts, router, readableError]);

  return { handlePublish, handleUnpublish, isToggleLoading };
}
