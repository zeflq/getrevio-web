"use client";

import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";

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
  const { onSuccess, onError, extraInvalidateKeys } = options ?? {};

  return useMutation({
    mutationFn: async (input: LandingActionInput) => {
      return http.post(endpoints.landings.publish.replace(":id", input.id), {
        merchantId: input.merchantId,
      });
    },
    onSuccess: (data, input) => {
      qc.invalidateQueries({ queryKey: landingKeys.list });
      qc.invalidateQueries({ queryKey: landingKeys.lite });
      if (input?.id) {
        qc.invalidateQueries({ queryKey: landingKeys.item(input.id) });
      }
      extraInvalidateKeys?.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      onSuccess?.({ data, input });
    },
    onError: (error, input) => {
      onError?.({ error, input });
    },
  });
}

export type LandingPublishAction = ReturnType<typeof usePublishAction>;
