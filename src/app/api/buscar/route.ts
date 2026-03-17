import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Resolve the path to the JSON file safely
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'registros.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'Datos no encontrados en el servidor' }, { status: 500 });
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const registros = JSON.parse(fileContent);

    // Search for the specific document number (case insensitive, trimmed)
    const normalizedId = String(id).trim().toLowerCase();
    
    // Search in "Número de documento del niño" or "id" for backward compatibility
    const record = registros.find((r: any) => 
      String(r["Número de documento del niño"] || '').trim().toLowerCase() === normalizedId ||
      String(r.id || '').trim().toLowerCase() === normalizedId
    );

    if (record) {
      return NextResponse.json(record, { status: 200 });
    } else {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('API /buscar Error:', error);
    return NextResponse.json({ error: 'Error del Servidor' }, { status: 500 });
  }
}
