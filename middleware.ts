import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from './lib/config';

// Pages reachable without a session
const PUBLIC_PATHS = ['/login', '/session-expired'];

/** Reads the JWT's `exp` claim (no signature check: the API verifies the token on every call). */
function isUsable(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp !== 'number' || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const loggedIn = isUsable(token);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!loggedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE); // expired or malformed
    return res;
  }

  if (loggedIn && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (token && !loggedIn) res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const config = {
  // Everything except Next internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|svg|ico|webp)$).*)'],
};
