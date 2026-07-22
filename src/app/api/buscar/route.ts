import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Kid } from "@/lib/types/kid";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const id = typeof body === "object" && body !== null && "id" in body
      ? String((body as Record<string, unknown>).id ?? "").trim()
      : "";

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    const dataKids = await redis.get<Kid[]>("dataKids") ?? [];

    const record = dataKids.find((r) => {
      const docField = String(r["Número de documento del niño"] ?? "").trim();
      const idField = String((r as unknown as Record<string, unknown>).id ?? "").trim();
      return docField === id || idField === id;
    });

    if (record) {
      return NextResponse.json(record, { status: 200 });
    }

    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  } catch (error) {
    console.error("API /buscar Error:", error);
    return NextResponse.json({ error: "Error del Servidor" }, { status: 500 });
  }
}
