import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/verify-otp",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public auth routes through
  if (PUBLIC_API_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Protect all /api/* and /dashboard/* routes
  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard") || pathname.startsWith("/menu") || pathname.startsWith("/reports") || pathname.startsWith("/settings") || pathname.startsWith("/billing")) {
    const session = await getSessionFromRequest(req);

    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Inject session claims into request headers so API routes don't need to re-verify
    const headers = new Headers(req.headers);
    headers.set("x-restaurant-id", session.restaurantId);
    headers.set("x-user-id", session.userId);
    headers.set("x-user-role", session.role);
    headers.set("x-user-name", session.name);

    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/menu/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/billing/:path*",
  ],
};
