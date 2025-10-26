import type { PlaceUpdateInput } from "@/features/places/model/placeSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import type { UpdatePlaceCommand } from "../dto/updatePlaceCommand";
import type { PlaceRepository, PlaceUpdateRecord } from "../interfaces/placeRepository";

export class UpdatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: UpdatePlaceCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const { id, tenantId, userRole: _role, ...payload } = command;

    const normalized = this.normalizePayload(payload);

    const record: PlaceUpdateRecord = {
      id,
      ...normalized,
    };

    await this.repository.update(record, tenantId ?? null);
  }

  private normalizePayload(input: PlaceUpdateInput): PlaceUpdateInput {
    const normalized: PlaceUpdateInput = { ...input };

    if (normalized.localName !== undefined && normalized.localName !== null) {
      normalized.localName = normalized.localName.trim();
    }

    if (normalized.slug !== undefined && normalized.slug !== null) {
      normalized.slug = normalized.slug.trim();
    }

    if (normalized.address !== undefined && normalized.address !== null) {
      normalized.address = normalized.address.trim();
    }

    if (normalized.googlePlaceId !== undefined && normalized.googlePlaceId !== null) {
      normalized.googlePlaceId = normalized.googlePlaceId.trim();
    }

    return normalized;
  }

  private ensureTenantAccess(command: UpdatePlaceCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId && command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
