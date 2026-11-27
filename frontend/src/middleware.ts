import { NextRequest, NextResponse } from 'next/server';

/**
 * Lapisan pertama: tanpa cookie sesi -> langsung ke /login (tanpa menunggu JS dimuat).
 * Middleware TIDAK memverifikasi token. Keamanan sebenarnya ada di backend
 * (JwtAuthGuard + RolesGuard); ini hanya untuk pengalaman pengguna.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('access_token');
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/profile/:path*'] };
