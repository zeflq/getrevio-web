import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  ThemeCreateRecord,
  ThemeRepository,
  ThemeUpdateRecord,
} from "../../application/interfaces/themeRepository";

export class PrismaThemeRepository implements ThemeRepository {
  constructor(private readonly client: Prisma.ThemeDelegate = prisma.theme) {}

  async create(data: ThemeCreateRecord): Promise<string> {
    const created = await this.client.create({
      data: {
        merchantId: data.merchantId,
        name: data.name,
        meta:
          data.meta === undefined
            ? undefined // ne pas toucher à la colonne
            : data.meta === null
              ? Prisma.JsonNull   // JSON null ({} -> null JSON)
              : (data.meta as Prisma.InputJsonValue), // vrai JSON
      },
    });

    return created.id;
  }

  async update(data: ThemeUpdateRecord, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(data.id, tenantId ?? null);

    const patch: Prisma.ThemeUpdateInput = {};

    if (data.name !== undefined) {
      patch.name = data.name;
    }

    if (data.meta !== undefined) {
      patch.meta = data.meta === null
                ? Prisma.JsonNull   // JSON null ({} -> null JSON)
                : (data.meta as Prisma.InputJsonValue); // vrai JSON
    }

    if (data.merchantId !== undefined) {
      patch.merchant = { connect: { id: data.merchantId } };
    }

    if (Object.keys(patch).length === 0) {
      const existing = await this.client.findUnique({
        where: { id: data.id },
        select: { id: true },
      });
      if (!existing) {
        throw new Error("NOT_FOUND");
      }
      return;
    }

    await this.client.update({
      where: { id: data.id },
      data: patch,
    });
  }

  async delete(id: string, tenantId?: string | null): Promise<void> {
    await this.ensureTenant(id, tenantId ?? null);
    await this.client.delete({ where: { id } });
  }

  private async ensureTenant(id: string, tenantId: string | null) {
    if (!tenantId) return;
    const existing = await this.client.findFirst({
      where: {
        id,
        merchantId: tenantId,
      },
      select: { id: true },
    });
    if (!existing) {
      throw new Error("FORBIDDEN");
    }
  }
}
