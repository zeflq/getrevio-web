import type { LandingCreateInput } from "@/features/landings/model/landingSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreateLandingCommand } from "../dto/createLandingCommand";
import type { LandingCreateRecord, LandingRepository } from "../interfaces/landingRepository";
import type { LandingAssociationGateway } from "../interfaces/landingAssociationGateway";

export class CreateLandingUseCase {
  constructor(
    private readonly repository: LandingRepository,
    private readonly associations?: LandingAssociationGateway
  ) {}

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

    const landingId = await this.repository.create(record);

    if (payload.belongsTo && this.associations) {
      await this.associations.attach(payload.belongsTo, landingId, command.tenantId);
    }

    return landingId;
  }

  private ensureTenantAccess(command: CreateLandingCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
