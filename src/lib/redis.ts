import { Redis } from "@upstash/redis";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

function createClient(): Redis {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Upstash Redis no está configurado. Define KV_REST_API_URL y KV_REST_API_TOKEN en el entorno."
    );
  }

  return new Redis({ url, token });
}

export const redis: Redis = globalThis.__redisClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__redisClient = redis;
}
