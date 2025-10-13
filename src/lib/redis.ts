// src/lib/redis.ts
import Redis from "ioredis";

/** Surface minimale que ton code consomme */
export type RedisLike = {
  set: (key: string, value: string) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  expire: (key: string, seconds: number) => Promise<unknown>;
  exists: (key: string) => Promise<number>;
  multi: () => {
    set: (key: string, value: string) => void;
    del: (key: string) => void;
    expire: (key: string, seconds: number) => void;
    exists: (key: string) => void;
    exec: () => Promise<unknown>;
  };
};

let _client: Redis | null = null;
let _adapter: RedisLike | null = null;

/**
 * ioredis-only (Upstash OK via rediss://).
 * Pas d’events ni de méthodes non typées.
 */
export function getRedis(): RedisLike {
  if (_adapter) return _adapter;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      "Missing REDIS_URL (ex: rediss://:PASSWORD@eu1-xxx.upstash.io:6379/?family=6)"
    );
  }

  // Connexion auto à la première commande
  _client = new Redis(url, {
    lazyConnect: false,
    enableAutoPipelining: true,
    maxRetriesPerRequest: 3,
    family: process.env.REDIS_FAMILY ? Number(process.env.REDIS_FAMILY) : undefined,
  });

  // Adapter typé, sans exposer Redis lui-même
  const io = _client as unknown as {
    set: (k: string, v: string) => Promise<unknown>;
    del: (k: string) => Promise<unknown>;
    expire: (k: string, s: number) => Promise<unknown>;
    exists: (k: string) => Promise<number>;
    multi: () => {
      set: (k: string, v: string) => void;
      del: (k: string) => void;
      expire: (k: string, s: number) => void;
      exists: (k: string) => void;
      exec: () => Promise<unknown>;
    };
  };

  _adapter = {
    set: (k, v) => io.set(k, v),
    del: (k) => io.del(k),
    expire: (k, s) => io.expire(k, s),
    exists: (k) => io.exists(k),
    multi: () => {
      const m = io.multi();
      return {
        set: (k, v) => m.set(k, v),
        del: (k) => m.del(k),
        expire: (k, s) => m.expire(k, s),
        exists: (k) => m.exists(k),
        exec: () => m.exec(),
      };
    },
  };

  return _adapter;
}

/** Optionnel: pour tests/shutdown */
export async function closeRedis() {
  if (!_client) return;
  try {
    // best-effort: certaines configs ne typent pas quit()
    const anyClient = _client as unknown as { quit?: () => Promise<unknown>; disconnect?: () => void };
    if (typeof anyClient.quit === "function") {
      await anyClient.quit();
    } else if (typeof anyClient.disconnect === "function") {
      anyClient.disconnect();
    }
  } finally {
    _client = null;
    _adapter = null;
  }
}
