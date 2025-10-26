import type { PlaceCreateInput } from "@/features/places/model/placeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreatePlaceCommand } from "../dto/createPlaceCommand";
import type { PlaceCreateRecord, PlaceRepository } from "../interfaces/placeRepository";

export class CreatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: CreatePlaceCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { tenantId: _tenantId, userRole: _role, ...payload } = command;

    const data: PlaceCreateInput = {
      ...payload,
      localName: payload.localName.trim(),
      slug: payload.slug.trim(),
      address: payload.address?.trim() ?? undefined,
      googlePlaceId: payload.googlePlaceId?.trim() ?? undefined,
    };

    const record: PlaceCreateRecord = {
      merchantId: data.merchantId,
      localName: data.localName,
      slug: data.slug,
      address: data.address ?? null,
      landingDefaults: data.landingDefaults,
      googlePlaceId: data.googlePlaceId ?? null,
    };

    await this.repository.create(record);
  }

  private ensureTenantAccess(command: CreatePlaceCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
