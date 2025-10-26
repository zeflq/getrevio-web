import { SUPER_ADMIN } from "@/lib/utils";

import type { DeleteThemeCommand } from "../dto/deleteThemeCommand";
import type { ThemeRepository } from "../interfaces/themeRepository";

export class DeleteThemeUseCase {
  constructor(private readonly repository: ThemeRepository) {}

  async execute(command: DeleteThemeCommand): Promise<void> {
    this.ensureTenantAccess(command);
    await this.repository.delete(command.id, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: DeleteThemeCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    // repository enforces tenant check
  }
}
