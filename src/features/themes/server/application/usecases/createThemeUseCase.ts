import type { ThemeCreateInput } from "@/features/themes/model/themeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreateThemeCommand } from "../dto/createThemeCommand";
import type { ThemeCreateRecord, ThemeRepository } from "../interfaces/themeRepository";

export class CreateThemeUseCase {
  constructor(private readonly repository: ThemeRepository) {}

  async execute(command: CreateThemeCommand): Promise<string> {
    this.ensureTenantAccess(command);

    const { tenantId: _tenantId, userRole: _role, ...payload } = command;

    const data: ThemeCreateInput = {
      ...payload,
      name: payload.name.trim(),
    };

    const record: ThemeCreateRecord = {
      merchantId: data.merchantId,
      name: data.name,
      meta: data.meta,
    };

    return this.repository.create(record);
  }

  private ensureTenantAccess(command: CreateThemeCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
