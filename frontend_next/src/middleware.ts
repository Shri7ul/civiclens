import { NextResponse, type NextRequest } from "next/server";
import { protectedPrefixes, roleHomePath } from "@/lib/routes";
import type { UserRole } from "@/types/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value as UserRole | undefined;
  const matchedRole = (Object.entries(protectedPrefixes) as Array<[UserRole, string]>).find(([, prefix]) =>
    pathname.startsWith(prefix),
  )?.[0];

  if (!matchedRole) return NextResponse.next();

  if (!token || !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // allow inherited roles: check `roles` cookie (JSON array) or `has_citizen_services` flag
  const rolesCookie = request.cookies.get("roles")?.value;
  const hasCitizenFlag = request.cookies.get("has_citizen_services")?.value;

  let allowed = false;
  if (role === matchedRole) allowed = true;
  else if (rolesCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rolesCookie));
      if (Array.isArray(parsed) && parsed.includes(matchedRole)) allowed = true;
    } catch (e) {
      // ignore parse errors
    }
  }

  if (!allowed && hasCitizenFlag === "1") {
    allowed = true;
  }

  if (!allowed) {
    return NextResponse.redirect(new URL(roleHomePath[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/citizen/:path*", "/officer/:path*", "/authority/:path*", "/contractor/:path*", "/admin/:path*"],
};
