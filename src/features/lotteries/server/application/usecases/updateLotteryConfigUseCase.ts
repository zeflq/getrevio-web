import type { LotteryConfigRepository } from "../interfaces/lotteryConfigRepository";
import type { LotteryConfigUpdateRecord } from "../interfaces/lotteryConfigRepository";
import { SUPER_ADMIN } from "@/lib/utils";
import type { LotteryConfigFormValues } from "@/features/lotteries/model/lotterySchema";

type UpdateLotteryConfigCommand = LotteryConfigFormValues & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};

const toBoolean = (value: "true" | "false") => value === "true";

export class UpdateLotteryConfigUseCase {
  constructor(private readonly repository: LotteryConfigRepository) {}

  async execute(command: UpdateLotteryConfigCommand): Promise<void> {
    this.ensureTenantAccess(command);

    const record: LotteryConfigUpdateRecord = {
      id: command.id,
      merchantId: command.merchantId,
      name: command.name.trim(),
      enabled: toBoolean(command.enabled),
      playLimitPerUser: command.playLimitPerUser,
      cooldown: command.cooldown,
      noWinWeight: command.noWinWeight,
      guaranteeWinOnFirstPlay: toBoolean(command.guaranteeWinOnFirstPlay),
      gifts: command.gifts,
    };

    await this.repository.update(record, command.tenantId ?? null);
  }

  private ensureTenantAccess(command: UpdateLotteryConfigCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId && command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
