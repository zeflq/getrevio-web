import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  MerchantCreateRecord,
  MerchantRecord,
  MerchantRepository,
  MerchantUpdateRecord,
} from "../../application/interfaces/merchantRepository";
import { merchantSelect } from "./merchantSelects";

export class PrismaMerchantRepository implements MerchantRepository {
  constructor(private readonly client: Prisma.MerchantDelegate = prisma.merchant) {}

  async create(data: MerchantCreateRecord): Promise<MerchantRecord> {
    const created = await this.client.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        locale: data.locale ?? null,
        defaultThemeId: data.defaultThemeId ?? null,
        plan: data.plan,
        status: data.status,
      },
      select: merchantSelect,
    });

    return this.toRecord(created);
  }

  async update(data: MerchantUpdateRecord): Promise<MerchantRecord> {
    const patch: Prisma.MerchantUpdateInput = {};

    if (Object.prototype.hasOwnProperty.call(data, "name")) {
      patch.name = data.name ?? undefined;
    }

    if (Object.prototype.hasOwnProperty.call(data, "email")) {
      patch.email = data.email ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(data, "locale")) {
      patch.locale = data.locale ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(data, "defaultThemeId")) {
      patch.defaultTheme = data.defaultThemeId
        ? { connect: { id: data.defaultThemeId } }
        : { disconnect: true };
    }

    if (Object.prototype.hasOwnProperty.call(data, "plan")) {
      patch.plan = data.plan;
    }

    if (Object.prototype.hasOwnProperty.call(data, "status")) {
      patch.status = data.status;
    }

    if (Object.keys(patch).length === 0) {
      const existing = await this.client.findUnique({
        where: { id: data.id },
        select: merchantSelect,
      });
      if (!existing) {
        throw new Error("NOT_FOUND");
      }
      return this.toRecord(existing);
    }

    const updated = await this.client.update({
      where: { id: data.id },
      data: patch,
      select: merchantSelect,
    });

    return this.toRecord(updated);
  }

  async delete(id: string): Promise<MerchantRecord | null> {
    const existing = await this.client.findUnique({
      where: { id },
      select: merchantSelect,
    });

    if (!existing) return null;

    await this.client.delete({ where: { id } });

    return this.toRecord(existing);
  }

  async findById(id: string): Promise<MerchantRecord | null> {
    const row = await this.client.findUnique({
      where: { id },
      select: merchantSelect,
    });

    return row ? this.toRecord(row) : null;
  }

  private toRecord(row: Prisma.MerchantGetPayload<{ select: typeof merchantSelect }>): MerchantRecord {
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? null,
      locale: row.locale ?? null,
      defaultThemeId: row.defaultThemeId ?? null,
      plan: row.plan,
      status: row.status,
      createdAt: row.createdAt,
    };
  }
}
