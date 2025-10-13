import {
    PrismaClient
} from "@prisma/client";

/**
 * In Next.js dev, modules can re-run on HMR, which would create multiple Prisma clients.
 * We cache a single instance on globalThis to prevent that.
 */

const globalForPrisma = globalThis as unknown as {
    __prisma ? : PrismaClient;
};

export const prisma =
    globalForPrisma.__prisma ??
    new PrismaClient({
        // Optional: enable query logging in dev
        log: process.env.NODE_ENV === "development" ?
            ["query", "error", "warn"] :
            ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma = prisma;
}

export default prisma;