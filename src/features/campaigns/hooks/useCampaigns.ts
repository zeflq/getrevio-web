import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CampaignResponse, listCampaigns } from "../api/listCampaigns";

type Params = {
  q?: string;
  merchantId?: string;
  placeId?: string;
  status?: "draft" | "active" | "archived";
  _page?: number;
  _limit?: number;
  _sort?: "name" | "createdAt" | "status";
  _order?: "asc" | "desc";
};

export function useCampaigns(params: Params) {
  return useQuery<CampaignResponse, Error>({
    queryKey: ["campaigns", params],
    queryFn: () => listCampaigns(params),
    placeholderData: keepPreviousData,

    // nice defaults
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
