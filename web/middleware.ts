import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function base64UrlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}

function decodeToken(
  token: string
): { sub: string; role: string; exp: number } | null {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    if (payload.exp * 1000 > Date.now()) {
      return payload;
    }
  } catch {
    /* invalid token */
  }
  return null;
}

const PUBLIC_PATHS = ["/login"];
const USER_PATHS = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenFromQuery = request.nextUrl.searchParams.get("token");

  if (pathname === "/login" && tokenFromQuery) {
    const payload = decodeToken(tokenFromQuery);
    if (payload) {
      const dest = payload.role === "ADMIN" ? "/admin" : "/dashboard";
      const response = NextResponse.redirect(new URL(dest, request.url));
      response.headers.set(
        "Set-Cookie",
        `token=${tokenFromQuery}; Path=/; Max-Age=604800; SameSite=Lax`
      );
      return response;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = request.cookies.get("token")?.value;
  const payload = token ? decodeToken(token) : null;
  const isAuthenticated = !!payload;

  if (PUBLIC_PATHS.includes(pathname)) {
    if (isAuthenticated) {
      const dest = payload!.role === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || payload!.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (USER_PATHS.includes(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard", "/admin/:path*"],
};
