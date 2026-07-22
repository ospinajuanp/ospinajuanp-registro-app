import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET, ADMIN_COOKIE_NAME, type SessionJwtPayload } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify<SessionJwtPayload>(token, JWT_SECRET);

      if (payload.role === 'admin') {
        return NextResponse.next();
      }

      const isAuthorized = payload.isAuthorized === true || payload.isAuthorized === "true";

      if (!isAuthorized) {
        return NextResponse.redirect(new URL('/espera-aprobacion', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("JWT Verification failed:", error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
