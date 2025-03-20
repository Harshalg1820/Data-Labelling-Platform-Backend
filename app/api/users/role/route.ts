import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"

// Schema for role update
const updateRoleSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  role: z.enum(["PROVIDER", "WORKER"]),
})

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = updateRoleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
    }

    const { walletAddress, role } = validation.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!existingUser) {
      // Create user if not exists
      const newUser = await prisma.user.create({
        data: {
          walletAddress,
          role,
        },
      })

      return NextResponse.json(newUser)
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { walletAddress },
      data: { role },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}

