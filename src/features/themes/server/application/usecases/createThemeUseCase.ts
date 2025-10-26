import type { ThemeCreateInput } from "@/features/themes/model/themeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreateThemeCommand } from "../dto/createThemeCommand";
import type { ThemeCreateRecord, ThemeRepository } from "../interfaces/themeRepository";

export class CreateThemeUseCase {
  constructor(private readonly repository: ThemeRepository) {}

  async execute(command: CreateThemeCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { tenantId: _tenantId, userRole: _role, ...payload } = command;

    const data: ThemeCreateInput = {
      ...payload,
      name: payload.name.trim(),
      logoUrl: payload.logoUrl?.trim(),
      brandColor: payload.brandColor?.trim(),
      accentColor: payload.accentColor?.trim(),
      textColor: payload.textColor?.trim(),
    };

    const record: ThemeCreateRecord = {
      merchantId: data.merchantId,
      name: data.name,
      logoUrl: data.logoUrl ?? null,
      brandColor: data.brandColor ?? null,
      accentColor: data.accentColor ?? null,
      textColor: data.textColor ?? null,
      meta: data.meta,
    };

    await this.repository.create(record);
  }

  private ensureTenantAccess(command: CreateThemeCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
