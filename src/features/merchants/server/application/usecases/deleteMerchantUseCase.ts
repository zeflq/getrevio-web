import type { DeleteMerchantCommand } from "../dto/deleteMerchantCommand";
import type { MerchantRepository } from "../interfaces/merchantRepository";

export class DeleteMerchantUseCase {
  constructor(private readonly repository: MerchantRepository) {}

  async execute(command: DeleteMerchantCommand) {
    return this.repository.delete(command.id);
  }
}
