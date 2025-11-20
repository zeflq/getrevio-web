import type { Prisma } from "@prisma/client";
import type { LandingCreateInput, LandingUpdateInput } from "@/features/landings/model/landingSchema";

export type LandingCreateRecord = {
  merchantId: string;
  name: string;
  slug: string;
  contentDraft: Prisma.InputJsonValue;
  contentPublished?: Prisma.InputJsonValue | null;
  publishedAt?: string | Date | null;
  templateId?: string | null;
  themeId?: string | null;
};

export type LandingUpdateRecord = {
  id: string;
  merchantId?: string;
  name?: string;
  contentDraft?: Prisma.InputJsonValue;
  contentPublished?: Prisma.InputJsonValue | null;
  publishedAt?: string | Date | null;
  templateId?: string | null;
  themeId?: string | null;
};

export interface LandingRepository {
  create(data: LandingCreateRecord): Promise<string>;
  update(data: LandingUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
}
