import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const placeholderMode = true;

  if (placeholderMode) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(
    process.env.SESSION_COOKIE_NAME ?? 'dgen_superadmin_session'
  );
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isLogin = req.nextUrl.pathname === '/login';

  if (isDashboard && !cookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLogin && cookie) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
};
