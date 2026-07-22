"use server";

import { redis } from "@/lib/redis";
import type { VisitLog, LogVisitInput, CacheSettings } from "@/lib/types/visit";
import { requireAdmin } from "@/lib/auth/guards";

async function assertAdmin(): Promise<void> {
  const guard = await requireAdmin();
  if (!guard.ok) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function logVisit(data: LogVisitInput): Promise<{ success: boolean; error?: string }> {
  try {
    const visit: VisitLog = {
      id: data.id,
      uniqueId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      device: data.userAgent,
      name: data.name,
    };

    await redis.lpush("visits", JSON.stringify(visit));

    return { success: true };
  } catch (error) {
    console.error("Error logging visit to KV:", error);
    return { success: false, error: "Failed to log visit" };
  }
}

export async function getVisits(): Promise<VisitLog[]> {
  await assertAdmin();
  try {
    const visits = await redis.lrange<string>("visits", 0, -1);
    return visits.map((v) => (typeof v === "string" ? JSON.parse(v) : v));
  } catch (error) {
    console.error("Error fetching visits from KV:", error);
    return [];
  }
}

export async function deleteAllVisits(): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  try {
    await redis.del("visits");
    return { success: true };
  } catch (error) {
    console.error("Error deleting visits from KV:", error);
    return { success: false, error: "Failed to delete visits" };
  }
}

export async function getCacheSettings(): Promise<CacheSettings> {
  try {
    const settings = await redis.get<CacheSettings>("settings:cache");
    return settings ?? { forceUpdate: false };
  } catch (error) {
    console.error("Error fetching cache settings:", error);
    return { forceUpdate: false };
  }
}

export async function setCacheSettings(
  forceUpdate: boolean
): Promise<{ success: boolean }> {
  try {
    await redis.set("settings:cache", { forceUpdate });
    return { success: true };
  } catch (error) {
    console.error("Error saving cache settings:", error);
    return { success: false };
  }
}
