import type { LandingUpdateInput } from "@/features/landings/model/landingSchema";

export type UpdateLandingCommand = LandingUpdateInput & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};
