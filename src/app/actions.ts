"use server";

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export type VisitLog = {
  id: string;
  uniqueId: string;
  timestamp: string;
  device: string;
  name?: string;
};

export async function logVisit(data: { 
  id: string; 
  name?: string; 
  userAgent: string 
}) {
  try {
    const visit: VisitLog = {
      id: data.id,
      uniqueId: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      device: data.userAgent,
      name: data.name,
    };

    // Store in a list called 'visits'
    await redis.lpush("visits", JSON.stringify(visit));
    
    // Also keep a record by ID if needed for faster lookup
    // await redis.set(`visit:${visit.uniqueId}`, visit);


    return { success: true };
  } catch (error) {
    console.error("Error logging visit to KV:", error);
    return { success: false, error: "Failed to log visit" };
  }
}

export async function getVisits(): Promise<VisitLog[]> {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn("ADMIN_PASSWORD not set");
    }

    const visits = await redis.lrange<string>("visits", 0, -1);
    return visits.map((v) => typeof v === 'string' ? JSON.parse(v) : v);
  } catch (error) {

    console.error("Error fetching visits from KV:", error);
    return [];
  }
}
