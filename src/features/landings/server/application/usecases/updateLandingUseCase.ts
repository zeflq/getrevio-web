import type { LandingUpdateInput } from "@/features/landings/model/landingSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { UpdateLandingCommand } from "../dto/updateLandingCommand";
import type { LandingRepository, LandingUpdateRecord } from "../interfaces/landingRepository";
import type { LandingAssociationGateway } from "../interfaces/landingAssociationGateway";

export class UpdateLandingUseCase {
  constructor(
    private readonly repository: LandingRepository,
    private readonly associations?: LandingAssociationGateway
  ) {}

  async execute(command: UpdateLandingCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { id, tenantId, userRole: _role, ...payload } = command;
    const normalized = this.normalizePayload(payload);
    const { belongsTo, slug: _slug, ...rest } = normalized;

    const record: LandingUpdateRecord = {
      id,
      ...rest,
    };

    if (record.status && record.status !== "published") {
      record.publishedAt = null;
    } else if (record.status === "published" && !record.publishedAt) {
      record.publishedAt = new Date().toISOString();
    }

    await this.repository.update(record, tenantId ?? null);

    if (belongsTo && this.associations) {
      await this.associations.attach(belongsTo, id, tenantId ?? null);
    }
  }

  private normalizePayload(input: LandingUpdateInput): LandingUpdateInput {
    const normalized: LandingUpdateInput = { ...input };

    if (normalized.name !== undefined && normalized.name !== null) {
      normalized.name = normalized.name.trim();
    }

    return normalized;
  }

  private ensureTenantAccess(command: UpdateLandingCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId && command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
