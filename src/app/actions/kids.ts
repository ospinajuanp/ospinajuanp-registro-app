"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import type { Kid, KidUpdate } from "@/lib/types/kid";

export async function getKids(): Promise<Kid[]> {
  const data = await redis.get<Kid[]>("dataKids");
  return data ?? [];
}

export async function addKid(formData: Kid): Promise<{ success: boolean; error?: string }> {
  const dataKids = await redis.get<Kid[]>("dataKids") ?? [];

  const exists = dataKids.find(
    (k) => k["Número de documento del niño"] === formData["Número de documento del niño"]
  );
  if (exists) {
    return { success: false, error: "Ya existe un niño con este número de documento" };
  }

  dataKids.push(formData);
  await redis.set("dataKids", dataKids);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function updateKid(
  docId: string,
  formData: KidUpdate
): Promise<{ success: boolean; error?: string }> {
  const dataKids = await redis.get<Kid[]>("dataKids") ?? [];

  const index = dataKids.findIndex(
    (k) => String(k["Número de documento del niño"]) === String(docId)
  );
  if (index === -1) {
    return { success: false, error: "Niño no encontrado" };
  }

  dataKids[index] = { ...dataKids[index], ...formData };

  await redis.set("dataKids", dataKids);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function deleteKid(docId: string): Promise<{ success: boolean; error?: string }> {
  const dataKids = await redis.get<Kid[]>("dataKids") ?? [];

  const filtered = dataKids.filter(
    (k) => String(k["Número de documento del niño"]) !== String(docId)
  );

  await redis.set("dataKids", filtered);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function deleteAllKids(): Promise<{ success: boolean }> {
  await redis.set("dataKids", []);
  revalidatePath("/dashboard/kids");
  return { success: true };
}

export async function deleteMultipleKids(
  docIds: ReadonlyArray<string>
): Promise<{ success: boolean }> {
  const dataKids = await redis.get<Kid[]>("dataKids") ?? [];

  const stringIds = docIds.map((id) => String(id));
  const filtered = dataKids.filter(
    (k) => !stringIds.includes(String(k["Número de documento del niño"]))
  );

  await redis.set("dataKids", filtered);
  revalidatePath("/dashboard/kids");
  return { success: true };
}
