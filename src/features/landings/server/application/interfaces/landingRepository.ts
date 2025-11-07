import type { LandingCreateInput, LandingUpdateInput } from "@/features/landings/model/landingSchema";

export type LandingCreateRecord = {
  merchantId: string;
  name: string;
  status: LandingCreateInput["status"];
  content: LandingCreateInput["content"];
  publishedAt?: string | Date | null;
};

export type LandingUpdateRecord = {
  id: string;
  merchantId?: string;
  name?: string;
  status?: LandingUpdateInput["status"];
  content?: LandingUpdateInput["content"];
  publishedAt?: string | Date | null;
};

export interface LandingRepository {
  create(data: LandingCreateRecord): Promise<string>;
  update(data: LandingUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
