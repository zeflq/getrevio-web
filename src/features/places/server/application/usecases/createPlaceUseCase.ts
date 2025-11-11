import type { PlaceCreateInput } from "@/features/places/model/placeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { CreatePlaceCommand } from "../dto/createPlaceCommand";
import type { PlaceCreateRecord, PlaceRepository } from "../interfaces/placeRepository";

export class CreatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: CreatePlaceCommand): Promise<string> {
    this.ensureTenantAccess(command);

    const { tenantId: _tenantId, userRole: _role, ...payload } = command;

    const data: PlaceCreateInput = {
      ...payload,
      localName: payload.localName.trim(),
      address: payload.address?.trim() ?? undefined,
    };

    const record: PlaceCreateRecord = {
      merchantId: data.merchantId,
      localName: data.localName,
      address: data.address ?? null,
      googlePlaceId: data.googlePlaceId ?? null,
    };

    return this.repository.create(record);
  }

  private ensureTenantAccess(command: CreatePlaceCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
