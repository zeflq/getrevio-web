import { SUPER_ADMIN } from "@/lib/utils";

import type { CreateShortlinkCommand } from "../dto/createShortlinkCommand";
import type { ShortlinkMutationRepository } from "../interfaces/shortlinkRepository";
import { generateRandomCode } from "../../domain/services/codeGenerator";
import { shortlinkCreateSchema } from "@/features/shortlinks/model/shortlinkSchema";

const MAX_CODE_ATTEMPTS = 10;

export class CreateShortlinkUseCase {
  constructor(private readonly repository: ShortlinkMutationRepository) {}

  async execute(command: CreateShortlinkCommand) {
    this.ensureTenantAccess(command);

    const parsed = shortlinkCreateSchema.parse(command);

    const code = await this.resolveCode(parsed.code);

    const created = await this.repository.create({
      ...parsed,
      code,
    });

    return created;
  }

  private async resolveCode(preferred?: string) {
    const trimmed = preferred?.trim();
    if (trimmed) {
      const available = await this.repository.isCodeAvailable(trimmed);
      if (!available) {
        throw new Error("SHORTLINK_CODE_ALREADY_EXISTS");
      }
      return trimmed;
    }

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const candidate = generateRandomCode();
      const available = await this.repository.isCodeAvailable(candidate);
      if (available) return candidate;
    }

    throw new Error("SHORTLINK_CODE_GENERATION_FAILED");
  }

  private ensureTenantAccess(command: CreateShortlinkCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
