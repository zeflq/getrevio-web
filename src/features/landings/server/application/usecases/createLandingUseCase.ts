import type { LandingCreateInput } from "@/features/landings/model/landingSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreateLandingCommand } from "../dto/createLandingCommand";
import type { LandingCreateRecord, LandingRepository } from "../interfaces/landingRepository";

export class CreateLandingUseCase {
  constructor(private readonly repository: LandingRepository) {}

  async execute(command: CreateLandingCommand): Promise<string> {
    this.ensureTenantAccess(command);

    const { tenantId: _tenantId, userRole: _role, ...payload } = command;

    const data: LandingCreateInput = {
      ...payload,
      name: payload.name.trim(),
    };

    const record: LandingCreateRecord = {
      merchantId: data.merchantId,
      name: data.name,
      status: data.status,
      content: data.content,
      publishedAt: data.status === "published" ? new Date().toISOString() : null,
    };

    return this.repository.create(record);
  }

  private ensureTenantAccess(command: CreateLandingCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
