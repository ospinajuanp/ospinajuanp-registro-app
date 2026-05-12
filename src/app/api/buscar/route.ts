import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Normalizamos el ID para la búsqueda
    const normalizedId = String(id).trim();
    
    // Buscar en la colección dataKids de Upstash Redis
    const dataKids = await redis.get<any[]>("dataKids") || [];
    
    // Buscar por número de documento (o ID por compatibilidad)
    const record = dataKids.find(r => 
      String(r["Número de documento del niño"] || '').trim() === normalizedId ||
      String(r.id || '').trim() === normalizedId
    );

    if (record) {
      return NextResponse.json(record, { status: 200 });
    } else {
      // Opcional: Para mantener compatibilidad hacia atrás si aún no han migrado, 
      // podrías leer del JSON local aquí si falla Redis. Pero como el requerimiento 
      // es evolucionar a carga dinámica, solo usamos Redis.
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('API /buscar Error:', error);
    return NextResponse.json({ error: 'Error del Servidor' }, { status: 500 });
  }
}
