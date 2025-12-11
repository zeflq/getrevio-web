"use client";

import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { publishLandingAction } from "@/features/landings/server/actions";

type LandingActionInput = {
  id: string;
  merchantId: string;
};

type ActionHookOptions = {
  onSuccess?: (args: { data: unknown; input: LandingActionInput }) => void;
  onError?: (args: { error: unknown; input: LandingActionInput }) => void;
  extraInvalidateKeys?: QueryKey[];
};

const landingKeys = {
  list: ["landings", "list"] as const,
  lite: ["landings", "lite"] as const,
  item: (id: string) => ["landings", "item", id] as const,
};

export function usePublishAction(options?: ActionHookOptions) {
  const qc = useQueryClient();
  const { onSuccess, onError, extraInvalidateKeys, ...rest } = options ?? {};
  return useAction(publishLandingAction, {
    ...rest,
    onSuccess: (args) => {
      const input = args.input as LandingActionInput;
      qc.invalidateQueries({ queryKey: landingKeys.list });
      qc.invalidateQueries({ queryKey: landingKeys.lite });
      if (input?.id) {
        qc.invalidateQueries({ queryKey: landingKeys.item(input.id) });
      }
      extraInvalidateKeys?.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      onSuccess?.({ data: args.data, input });
    },
    onError: (args) => {
      onError?.({ error: args.error, input: args.input as LandingActionInput });
    },
  });
}

export type LandingPublishAction = ReturnType<typeof usePublishAction>;
