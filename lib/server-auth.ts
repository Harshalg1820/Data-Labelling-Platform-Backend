import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { type NextRequest, NextResponse } from "next/server"

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth(req: NextRequest, roles?: string[]) {
  const session = await getAuthSession()

  if (!session) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      success: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return {
    success: true,
    session,
  }
}

