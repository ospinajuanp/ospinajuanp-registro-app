import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const REQUIRED_COLUMNS = [
  "Tipo de documento del niño",
  "Número de documento del niño",
  "Nombre completo del niño",
  "Sede",
  "Tipo de paquete",
  "Recibe paquete",
  "fecha",
  "hora"
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const records = body.records;
    const mode: "merge" | "replace" = body.mode === "replace" ? "replace" : "merge";

    console.log(`[Import] Mode: ${mode} | Records received: ${records?.length ?? 0}`);

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron registros válidos.' },
        { status: 400 }
      );
    }

    // Validate that records have the required key field
    const invalidRecords = records.filter(r => !r["Número de documento del niño"]);
    if (invalidRecords.length > 0) {
      return NextResponse.json(
        { error: `${invalidRecords.length} registro(s) no tienen "Número de documento del niño". Todos los registros deben tener este campo.` },
        { status: 400 }
      );
    }

    let updatedData: any[];

    if (mode === "replace") {
      // DELETE all existing data and replace with new records only
      console.log(`[Import] REPLACE: Deleting all existing data, setting ${records.length} new records`);
      updatedData = records;
    } else {
      // MERGE: keep existing data, add new records, update matching ones
      const existingData = await redis.get<any[]>("dataKids") || [];
      console.log(`[Import] MERGE: Existing records: ${existingData.length}, New records: ${records.length}`);

      const dataMap = new Map<string, any>();

      // First load all existing records
      existingData.forEach(item => {
        const docId = item["Número de documento del niño"];
        if (docId) dataMap.set(String(docId), item);
      });

      // Then add/overwrite with new records
      for (const record of records) {
        const docId = record["Número de documento del niño"];
        if (docId) dataMap.set(String(docId), record);
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
      message: mode === "replace"
        ? `Base de datos reemplazada con ${records.length} registros.`
        : `Se fusionaron ${records.length} registros. Total en BD: ${updatedData.length}.`
    });
  } catch (error) {
    console.error('[Import] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor durante la importación.' },
      { status: 500 }
    );
  }
}
