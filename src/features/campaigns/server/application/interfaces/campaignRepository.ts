export type CampaignCreateRecord = {
  merchantId: string;
  placeId: string;
  name: string;
  status: "draft" | "active" | "archived";
};

export type CampaignUpdateRecord = {
  id: string;
  merchantId?: string;
  placeId?: string;
  name?: string;
  status?: "draft" | "active" | "archived";
};

export interface CampaignRepository {
  create(data: CampaignCreateRecord): Promise<void>;
  update(data: CampaignUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
