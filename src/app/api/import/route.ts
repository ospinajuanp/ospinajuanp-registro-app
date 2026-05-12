import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const records = body.records;
    const mode: "merge" | "replace" = body.mode || "merge";

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of records.' },
        { status: 400 }
      );
    }

    let updatedData: any[];

    if (mode === "replace") {
      // Reemplaza completamente la colección
      updatedData = records;
    } else {
      // Merge: mantiene los datos existentes y actualiza/agrega los nuevos
      const existingData = await redis.get<any[]>("dataKids") || [];

      const dataMap = new Map();
      existingData.forEach(item => {
        const docId = item["Número de documento del niño"];
        if (docId) dataMap.set(String(docId), item);
      });

      for (const record of records) {
        const docId = record["Número de documento del niño"];
        if (docId) dataMap.set(String(docId), record);
      }

      updatedData = Array.from(dataMap.values());
    }

    await redis.set("dataKids", updatedData);

    return NextResponse.json({
      success: true,
      count: records.length,
      total: updatedData.length,
      message: `Successfully processed ${records.length} records.`
    });
  } catch (error) {
    console.error('Error during mass import:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}

