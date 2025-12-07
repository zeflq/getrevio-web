import type { LotteryConfigCreateRecord, LotteryConfigRepository } from "../interfaces/lotteryConfigRepository";
import { SUPER_ADMIN } from "@/lib/utils";
import type { LotteryConfigFormValues } from "@/features/lotteries/model/lotterySchema";

type CreateLotteryConfigCommand = LotteryConfigFormValues & {
  tenantId?: string | null;
  userRole?: string | null;
};

const toBoolean = (value: "true" | "false") => value === "true";

export class CreateLotteryConfigUseCase {
  constructor(private readonly repository: LotteryConfigRepository) {}

  async execute(command: CreateLotteryConfigCommand): Promise<string> {
    this.ensureTenantAccess(command);

    const record: LotteryConfigCreateRecord = {
      merchantId: command.merchantId,
      name: command.name.trim(),
      enabled: toBoolean(command.enabled),
      playLimitPerUser: command.playLimitPerUser,
      cooldown: command.cooldown,
      noWinWeight: command.noWinWeight,
      guaranteeWinOnFirstPlay: toBoolean(command.guaranteeWinOnFirstPlay),
      contactMethod: command.contactMethod,
      gifts: command.gifts,
    };

    return this.repository.create(record);
  }

  private ensureTenantAccess(command: CreateLotteryConfigCommand) {
    if (!command.tenantId) return;
    if (command.userRole === SUPER_ADMIN) return;
    if (command.merchantId !== command.tenantId) {
      throw new Error("FORBIDDEN");
    }
  }
}
