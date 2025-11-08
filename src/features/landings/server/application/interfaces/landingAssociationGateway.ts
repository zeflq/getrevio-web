import type { LandingBelongsTo } from "@/features/landings/model/landingSchema";

export type LandingAssociationTarget = LandingBelongsTo;

export interface LandingAssociationGateway {
  attach(
    target: LandingAssociationTarget,
    landingId: string,
    tenantId?: string | null
  ): Promise<void>;
}

