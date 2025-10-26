import { shortlinkUpdateSchema } from "@/features/shortlinks/model/shortlinkSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { UpdateShortlinkCommand } from "../dto/updateShortlinkCommand";
import type { ShortlinkMutationRepository } from "../interfaces/shortlinkRepository";

export class UpdateShortlinkUseCase {
  constructor(private readonly repository: ShortlinkMutationRepository) {}

  async execute(command: UpdateShortlinkCommand) {
    this.ensureTenantAccess(command);

    const parsed = shortlinkUpdateSchema.parse(command);

    if (parsed.code !== undefined) {
      await this.assertCodeAvailability(parsed.code, command.id, command.tenantId ?? null);
    }

    const result = await this.repository.update({
      ...parsed,
      id: command.id,
    }, command.tenantId ?? null);

    return result;
  }

  private async assertCodeAvailability(code: string | undefined, id: string, tenantId: string | null) {
    if (!code) return;
    const trimmed = code.trim();
    const existing = await this.repository.findById(id, tenantId ?? undefined);
    if (existing?.code === trimmed) return;
    const available = await this.repository.isCodeAvailable(trimmed);
    if (!available) {
      throw new Error("SHORTLINK_CODE_ALREADY_EXISTS");
    }
  }

  private ensureTenantAccess(command: UpdateShortlinkCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId && command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
