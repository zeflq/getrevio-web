import { SUPER_ADMIN } from "@/lib/utils";

import type { DeletePlaceCommand } from "../dto/deletePlaceCommand";
import type { PlaceRepository } from "../interfaces/placeRepository";

export class DeletePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: DeletePlaceCommand): Promise<void> {
    this.ensureTenantAccess(command);
    await this.repository.delete(command.id, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: DeletePlaceCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    // repository ensureTenant enforces ownership
  }
}
