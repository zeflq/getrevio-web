import { createCrudHooks } from '@/hooks/createCrudHooks';
import { Campaign } from '@/types/domain';
import { listCampaigns } from '../api/listCampaigns';
import { getCampaignById } from '../api/getCampaignById';
import { createCampaign } from '../api/createCampaign';
import { updateCampaign } from '../api/updateCampaign';
import { deleteCampaign } from '../api/deleteCampaign';
import type { CampaignCreateInput, CampaignLite, CampaignQueryParams, CampaignUpdateInput } from '../model/campaignSchema';

// Build CRUD hooks using the shared utility and campaigns API
const crud = createCrudHooks<Campaign, string, CampaignLite>({
  keyBase: ['campaigns'],
  list: (params) => listCampaigns(params as CampaignQueryParams),
  get: (id) => getCampaignById(id),
  create: (input) => createCampaign(input as CampaignCreateInput),
  update: (id, input) => updateCampaign(id, input as CampaignUpdateInput),
  remove: (id) => deleteCampaign(id),
  staleTimeMs: 60_000,
  lite: {
    map: (p) => ({ id: p.id, name: p.name }),
    paramKey: "_lite",
    defaultLimit: 20,
  },
});

// Export typed hook wrappers for convenient usage
export const useCampaignsList = (params: CampaignQueryParams = {}) => crud.useList!(params);
export const useCampaignsLite = (
  params: Omit<CampaignQueryParams, "_lite"> = {},
  opts?: { enabled?: boolean }
) => crud.useLite!(params, opts);
export const useCampaignItem = (id?: string) => crud.useItem!(id);
export const useCreateCampaign = () => crud.useCreate!();
export const useUpdateCampaign = () => crud.useUpdate!();
export const useDeleteCampaign = () => crud.useRemove!();