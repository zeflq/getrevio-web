import { SUPER_ADMIN } from "@/lib/utils";

import type { UnpublishLandingCommand } from "../dto/unpublishLandingCommand";
import type { LandingRepository, LandingUpdateRecord } from "../interfaces/landingRepository";

export class UnpublishLandingUseCase {
  constructor(private readonly repository: LandingRepository) {}

  async execute(command: UnpublishLandingCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const record: LandingUpdateRecord = {
      id: command.id,
      status: "draft",
      contentPublished: null,
      publishedAt: null,
    };

    await this.repository.update(record, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: UnpublishLandingCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
  }
}
