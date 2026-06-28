import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE = "pis_access";

// Edge guard: unauthenticated users hitting a protected route are sent to
// /login; authenticated users hitting /login are sent to the dashboard.
// This is a coarse presence check — the backend remains the real authority.
const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get(ACCESS_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasToken && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasToken && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything except Next internals, static assets, and the API.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
