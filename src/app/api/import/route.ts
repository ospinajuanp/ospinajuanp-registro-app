import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Kid } from "@/lib/types/kid";
import { importSchema } from "@/lib/schemas/kids";
import { parseBody } from "@/lib/http/parseBody";

export async function POST(request: Request) {
  const parsed = await parseBody(request, importSchema);
  if (!parsed.ok) return parsed.response;

  const { records, mode } = parsed.data;

  console.log(`[Import] Mode: ${mode} | Records received: ${records.length}`);

  try {
    const invalidRecords = records.filter((r) => !r["Número de documento del niño"]);
    if (invalidRecords.length > 0) {
      return NextResponse.json(
        {
          error: `${invalidRecords.length} registro(s) no tienen "Número de documento del niño". Todos los registros deben tener este campo.`,
        },
        { status: 400 }
      );
    }

    let updatedData: Kid[];

    if (mode === "replace") {
      console.log(`[Import] REPLACE: Replacing all data with ${records.length} records`);
      updatedData = records as unknown as Kid[];
    } else {
      const existingData = await redis.get<Kid[]>("dataKids") ?? [];
      console.log(`[Import] MERGE: Existing records: ${existingData.length}, New records: ${records.length}`);

      const dataMap = new Map<string, Kid>();

      existingData.forEach((item) => {
        const docId = item["Número de documento del niño"];
        if (docId) dataMap.set(String(docId), item);
      });

      for (const record of records) {
        const docId = record["Número de documento del niño"];
        if (docId) dataMap.set(String(docId), record as unknown as Kid);
      }

      updatedData = Array.from(dataMap.values());
      console.log(`[Import] MERGE result: ${updatedData.length} total records after merge`);
    }

    await redis.set("dataKids", updatedData);

    return NextResponse.json({
      success: true,
      count: records.length,
      total: updatedData.length,
      mode,
      message:
        mode === "replace"
          ? `Base de datos reemplazada con ${records.length} registros.`
          : `Se fusionaron ${records.length} registros. Total en BD: ${updatedData.length}.`,
    });
  } catch (error) {
    console.error("[Import] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor durante la importación." },
      { status: 500 }
    );
  }
}
