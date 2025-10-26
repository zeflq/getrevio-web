import { z } from "zod";

import { merchantUpdateSchema } from "@/features/merchants/model/merchantSchema";

import type { UpdateMerchantCommand } from "../dto/updateMerchantCommand";
import type { MerchantRepository } from "../interfaces/merchantRepository";

const updateSchema = merchantUpdateSchema.extend({ id: z.string() });

export class UpdateMerchantUseCase {
  constructor(private readonly repository: MerchantRepository) {}

  async execute(command: UpdateMerchantCommand) {
    const parsed = updateSchema.parse(command);

    const patch: Parameters<MerchantRepository["update"]>[0] = {
      id: parsed.id,
    };

    if (Object.prototype.hasOwnProperty.call(parsed, "name")) {
      patch.name = parsed.name;
    }

    if (Object.prototype.hasOwnProperty.call(parsed, "email")) {
      patch.email = parsed.email ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(parsed, "locale")) {
      patch.locale = parsed.locale ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(parsed, "plan")) {
      patch.plan = parsed.plan;
    }

    if (Object.prototype.hasOwnProperty.call(parsed, "status")) {
      patch.status = parsed.status;
    }

    return this.repository.update(patch);
  }
}
