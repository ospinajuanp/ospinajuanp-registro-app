import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Kid } from "@/lib/types/kid";
import { buscarSchema } from "@/lib/schemas/kids";
import { parseBody } from "@/lib/http/parseBody";

export async function POST(request: Request) {
  const parsed = await parseBody(request, buscarSchema);
  if (!parsed.ok) return parsed.response;

  const { id } = parsed.data;

  try {
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
