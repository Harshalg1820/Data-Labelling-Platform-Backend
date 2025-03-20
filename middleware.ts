import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Skip authentication for public API routes
    if (request.nextUrl.pathname === "/api/auth/signin" || request.nextUrl.pathname === "/api/auth/callback") {
      return NextResponse.next()
    }

    const token = await getToken({ req: request })

    // If the user is not authenticated
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
}

