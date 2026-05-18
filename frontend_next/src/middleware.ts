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

  if (role !== matchedRole) {
    return NextResponse.redirect(new URL(roleHomePath[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/citizen/:path*", "/officer/:path*", "/authority/:path*", "/contractor/:path*", "/admin/:path*"],
};
