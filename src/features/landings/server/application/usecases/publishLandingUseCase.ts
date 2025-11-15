import { SUPER_ADMIN } from "@/lib/utils";

import type { PublishLandingCommand } from "../dto/publishLandingCommand";
import type { LandingQueryRepository } from "../interfaces/landingQueryRepository";
import type { LandingRepository, LandingUpdateRecord } from "../interfaces/landingRepository";

export class PublishLandingUseCase {
  constructor(
    private readonly repository: LandingRepository,
    private readonly queryRepository: LandingQueryRepository
  ) {}

  async execute(command: PublishLandingCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const landing = await this.queryRepository.getById({
      id: command.id,
      tenantId: command.tenantId ?? undefined,
    });

    if (!landing) {
      throw new Error("NOT_FOUND");
    }

    const record: LandingUpdateRecord = {
      id: command.id,
      status: "published",
      contentPublished: landing.contentDraft,
      publishedAt: new Date().toISOString(),
    };

    await this.repository.update(record, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: PublishLandingCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
  }
}
