import { SUPER_ADMIN } from "@/lib/utils";

import type { DeleteShortlinkCommand } from "../dto/deleteShortlinkCommand";
import type { ShortlinkMutationRepository } from "../interfaces/shortlinkRepository";

export class DeleteShortlinkUseCase {
  constructor(private readonly repository: ShortlinkMutationRepository) {}

  async execute(command: DeleteShortlinkCommand) {
    this.ensureTenantAccess(command);
    const deleted = await this.repository.delete(command.id, command.tenantId ?? null);
    return deleted;
  }

  private ensureTenantAccess(command: DeleteShortlinkCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    // repository enforces tenant matching via ensureTenant
  }
}
