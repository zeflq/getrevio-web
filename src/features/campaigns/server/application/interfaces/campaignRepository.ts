export type CampaignCreateRecord = {
  merchantId: string;
  placeId: string;
  name: string;
  primaryCtaUrl: string;
  status: "draft" | "active" | "archived";
  theme?: {
    brandColor?: string;
    logoUrl?: string;
  };
};

export type CampaignUpdateRecord = {
  id: string;
  merchantId?: string;
  placeId?: string;
  name?: string;
  primaryCtaUrl?: string;
  status?: "draft" | "active" | "archived";
  theme?: {
    brandColor?: string;
    logoUrl?: string;
  } | null;
};

export interface CampaignRepository {
  create(data: CampaignCreateRecord): Promise<void>;
  update(data: CampaignUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
