import { merchantCreateSchema } from "@/features/merchants/model/merchantSchema";

import type { CreateMerchantCommand } from "../dto/createMerchantCommand";
import type { MerchantRepository } from "../interfaces/merchantRepository";

export class CreateMerchantUseCase {
  constructor(private readonly repository: MerchantRepository) {}

  async execute(command: CreateMerchantCommand) {
    const parsed = merchantCreateSchema.parse(command);

    return this.repository.create({
      name: parsed.name,
      email: parsed.email ?? null,
      locale: parsed.locale ?? null,
      plan: parsed.plan,
      status: parsed.status,
    });
  }
}
