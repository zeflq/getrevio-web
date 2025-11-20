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
      slug: payload.slug.trim(),
    };

    const record: LandingCreateRecord = {
      merchantId: data.merchantId,
      name: data.name,
      slug: data.slug,
      status: data.status,
      contentDraft: data.content,
      contentPublished: data.status === "published" ? data.content : null,
      publishedAt: data.status === "published" ? new Date().toISOString() : null,
      templateId: data.templateId ?? null,
      themeId: data.themeId ?? null,
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
