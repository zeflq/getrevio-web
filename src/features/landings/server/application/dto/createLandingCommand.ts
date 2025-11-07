import type { LandingCreateInput } from "@/features/landings/model/landingSchema";

export type CreateLandingCommand = LandingCreateInput & {
  tenantId?: string | null;
  userRole?: string | null;
};
