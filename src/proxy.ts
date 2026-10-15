import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, CANDIDATE_COOKIE, STUDENT_COOKIE } from "@/lib/auth/cookie-names";

const STUDENT_PUBLIC = ["/student/login", "/student/register", "/student/forgot-password", "/student/reset-password"];

/**
 * Optimistic redirect for signed-out visitors (cookie presence only). This
 * is a convenience, not security: every page and API route validates the
 * session against the database and checks permissions itself.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !req.cookies.has(ADMIN_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (pathname.startsWith("/candidate") && !req.cookies.has(CANDIDATE_COOKIE)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/student") && !STUDENT_PUBLIC.includes(pathname) && !req.cookies.has(STUDENT_COOKIE)) {
    const login = new URL("/student/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/candidate/:path*", "/student/:path*"],
};
