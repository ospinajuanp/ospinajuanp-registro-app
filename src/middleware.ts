import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { Redis } from '@upstash/redis';

// Upstash es compatible con el Edge Runtime del Middleware
const redis = Redis.fromEnv();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev-only");

export async function middleware(request: NextRequest) {
  // Proteger solo las rutas que empiecen por /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // 1. Verificar que el JWT es válido
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // 2. Si entró con la contraseña de entorno (rol admin), pasa sin preguntar a Redis
      if (payload.role === 'admin') {
        return NextResponse.next();
      }

      // 3. Consultar en tiempo real si el usuario está autorizado
      const isAuthorized = await redis.hget(`user:${payload.email}`, 'isAuthorized');

      // 4. Comprobar si NO está autorizado
      if (isAuthorized !== true && isAuthorized !== "true") {
        // Redirigir a tu página de espera de aprobación
        return NextResponse.redirect(new URL('/espera-aprobacion', request.url));
      }

      // Si todo está bien, dejamos que la petición continúe
      return NextResponse.next();
    } catch (error) {
      console.error("JWT Verification failed:", error);
      // Token expirado o inválido
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
