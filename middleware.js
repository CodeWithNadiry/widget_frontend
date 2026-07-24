import { NextResponse } from "next/server";

// Lightweight, unverified decode of the JWT payload — good enough for a
// client-side redirect/UX decision. This is NOT a security boundary; the
// real enforcement is the isAuth + isAdmin middleware on the backend. Even
// if someone forged a token to get past this, every /admin/users request
// would still be rejected server-side.
function decodeRole(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

const PROTECTED_PREFIXES = ["/dashboard", "/chatbots", "/properties", "/documents", "/accounts"];

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (token && pathname.startsWith("/accounts")) {
    const role = decodeRole(token);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chatbots/:path*",
    "/properties/:path*",
    "/documents/:path*",
    "/accounts/:path*",
    "/login",
  ],
};