import type { LandingCreateInput, LandingUpdateInput } from "@/features/landings/model/landingSchema";

export type LandingCreateRecord = {
  merchantId: string;
  name: string;
  slug: string;
  status: LandingCreateInput["status"];
  contentDraft: LandingCreateInput["content"];
  contentPublished?: LandingCreateInput["content"] | null;
  publishedAt?: string | Date | null;
};

export type LandingUpdateRecord = {
  id: string;
  merchantId?: string;
  name?: string;
  status?: LandingUpdateInput["status"];
  contentDraft?: LandingUpdateInput["content"];
  contentPublished?: LandingUpdateInput["content"] | null;
  publishedAt?: string | Date | null;
};

export interface LandingRepository {
  create(data: LandingCreateRecord): Promise<string>;
  update(data: LandingUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
