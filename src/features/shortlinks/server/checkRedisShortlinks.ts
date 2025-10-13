
'use server';

import { z } from "zod";
import { actionUser } from "@/lib/actionUser";
import { getRedis } from "@/lib/redis";

/**
 * Check existence of multiple shortlink keys in Redis.
 * Returns { items: Array<{ code: string; exists: boolean }> }
 */
const codeKeyOf = (code: string) => `sl:${code}`;

export async function checkRedisShortlinks(codes: string[]) {
  if (!codes?.length) return { items: [] as Array<{ code: string; exists: boolean }> };
  const redis = getRedis();

  const pipeline = redis.multi();
  for (const code of codes) pipeline.exists(codeKeyOf(code));

  const results = (await pipeline.exec()) as Array<[unknown, number]> | number[] | unknown;

  // Normalize exec results to an array of numbers (exists returns 1 or 0)
  const values: number[] = Array.isArray(results)
    ? (results as any[]).map((r) => (Array.isArray(r) ? (r[1] as number) : (r as number)))
    : [];

  const items = codes.map((code, i) => ({ code, exists: values[i] === 1 }));
  return { items };
}

// next-safe-action server action wrapper
export const checkRedisShortlinksAction = actionUser
  .schema(
    z.object({ codes: z.array(z.string().min(1)).min(1) })
  )
  .action(async ({ parsedInput }) => {
    const { codes } = parsedInput;
    const { items } = await checkRedisShortlinks(codes);
    return { items } as const;
  });
