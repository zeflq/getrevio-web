import type { ThemeUpdateInput } from "@/features/themes/model/themeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { UpdateThemeCommand } from "../dto/updateThemeCommand";
import type { ThemeRepository, ThemeUpdateRecord } from "../interfaces/themeRepository";

export class UpdateThemeUseCase {
  constructor(private readonly repository: ThemeRepository) {}

  async execute(command: UpdateThemeCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { id, tenantId, userRole: _role, ...payload } = command;

    const normalized = this.normalizePayload(payload);

    const record: ThemeUpdateRecord = {
      id,
      ...normalized,
    };

    await this.repository.update(record, tenantId ?? null);
  }

  private normalizePayload(input: ThemeUpdateInput): ThemeUpdateInput {
    const normalized: ThemeUpdateInput = { ...input };

    if (normalized.name !== undefined && normalized.name !== null) {
      normalized.name = normalized.name.trim();
    }

    return normalized;
  }

  private ensureTenantAccess(command: UpdateThemeCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId && command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
