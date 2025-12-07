import type { LotteryConfigRepository } from "../interfaces/lotteryConfigRepository";

type DeleteLotteryConfigCommand = {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};

export class DeleteLotteryConfigUseCase {
  constructor(private readonly repository: LotteryConfigRepository) {}

  async execute(command: DeleteLotteryConfigCommand): Promise<void> {
    await this.repository.delete(command.id, command.tenantId ?? null);
  }
}
