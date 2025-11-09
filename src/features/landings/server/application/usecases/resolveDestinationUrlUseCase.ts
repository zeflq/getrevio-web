import type { LandingQueryRepository } from "../interfaces/landingQueryRepository";

export class ResolveDestinationUrlUseCase {
  constructor(private readonly landingQueryRepository: LandingQueryRepository) {}

  async execute(args: {
    landingId: string;
    baseUrl: string;
    tenantId?: string | null;
  }): Promise<string | undefined> {
    const result = await this.landingQueryRepository.getLandingWithMerchant({
      id: args.landingId,
      tenantId: args.tenantId ?? undefined,
    });

    if (!result || !result.landing || !result.merchant) return undefined;

    return `${args.baseUrl}/m/${result.merchant.slug}/l/${result.landing.slug}`;
  }
}