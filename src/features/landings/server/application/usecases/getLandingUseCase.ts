import type { LandingQueryRepository, LandingQueryOptions } from "../interfaces/landingQueryRepository";

export class GetLandingUseCase {
  constructor(private readonly repository: LandingQueryRepository) {}

  execute(args: { id: string; tenantId?: string; options?: LandingQueryOptions }) {
    return this.repository.getById(args);
  }
}
