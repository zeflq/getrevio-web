import { SUPER_ADMIN } from "@/lib/utils";

import type { SetDefaultThemeCommand } from "../dto/setDefaultThemeCommand";
import type { ThemeRepository } from "../interfaces/themeRepository";

export class SetDefaultThemeUseCase {
  constructor(private readonly repository: ThemeRepository) {}

  async execute(command: SetDefaultThemeCommand): Promise<void> {
    this.ensureTenantAccess(command);
    await this.repository.setDefaultTheme(command.merchantId, command.themeId, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: SetDefaultThemeCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
