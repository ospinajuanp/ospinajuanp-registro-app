"use server";

import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";

const redis = Redis.fromEnv();

export async function getKids() {
  const data = await redis.get<any[]>("dataKids");
  return data || [];
}

export async function addKid(formData: any) {
  const dataKids = await redis.get<any[]>("dataKids") || [];
  
  // Validar si ya existe
  const exists = dataKids.find(k => k["Número de documento del niño"] === formData["Número de documento del niño"]);
  if (exists) {
    return { success: false, error: "Ya existe un niño con este número de documento" };
  }

  dataKids.push(formData);
  await redis.set("dataKids", dataKids);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function updateKid(docId: string, formData: any) {
  const dataKids = await redis.get<any[]>("dataKids") || [];
  
  const index = dataKids.findIndex(k => String(k["Número de documento del niño"]) === String(docId));
  if (index === -1) {
    return { success: false, error: "Niño no encontrado" };
  }

  // Update only the provided fields
  dataKids[index] = { ...dataKids[index], ...formData };
  
  await redis.set("dataKids", dataKids);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function deleteKid(docId: string) {
  const dataKids = await redis.get<any[]>("dataKids") || [];
  
  const filtered = dataKids.filter(k => String(k["Número de documento del niño"]) !== String(docId));
  
  await redis.set("dataKids", filtered);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function deleteAllKids() {
  await redis.set("dataKids", []);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function deleteMultipleKids(docIds: string[]) {
  const dataKids = await redis.get<any[]>("dataKids") || [];
  
  const stringIds = docIds.map(id => String(id));
  const filtered = dataKids.filter(k => !stringIds.includes(String(k["Número de documento del niño"])));
  
  await redis.set("dataKids", filtered);
  revalidatePath("/dashboard/kids");
  return { success: true };
}
