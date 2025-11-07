import { SUPER_ADMIN } from "@/lib/utils";

import type { DeleteLandingCommand } from "../dto/deleteLandingCommand";
import type { LandingRepository } from "../interfaces/landingRepository";

export class DeleteLandingUseCase {
  constructor(private readonly repository: LandingRepository) {}

  async execute(command: DeleteLandingCommand): Promise<void> {
    this.ensureTenantAccess(command);
    await this.repository.delete(command.id, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: DeleteLandingCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    // other roles can't delete outside tenant scope; repository ensures merchant check
  }
}
