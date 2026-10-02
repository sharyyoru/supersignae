import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealSession } from "@/lib/session";

const protectedPaths = ["/dashboard", "/signatures", "/generators", "/team", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Let Next.js Server Actions through so they can validate their own auth.
  if (request.headers.get("next-action")) return NextResponse.next();
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const cookie = request.cookies.get("supersignae_session")?.value;
  const session = await unsealSession(cookie);
  if (!session.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|install|g/|login|register|$).*)"],
};
