import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Schema for rejection
const rejectionSchema = z.object({
  reason: z.string().min(1),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id
    const body = await request.json()

    // Validate request body
    const validation = rejectionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
    }

    const { reason } = validation.data

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if task is pending approval
    if (task.status !== "PENDING_APPROVAL") {
      return NextResponse.json({ error: "Task is not pending approval" }, { status: 400 })
    }

    // Check if user is the provider
    if (task.providerId !== session.user.id) {
      return NextResponse.json({ error: "Only the task provider can reject this task" }, { status: 403 })
    }

    // Delete submission
    await prisma.submission.delete({
      where: { taskId },
    })

    // Update task status back to available
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "AVAILABLE",
        workerId: null,
      },
    })

    return NextResponse.json({
      success: true,
      reason,
    })
  } catch (error) {
    console.error("Error rejecting task:", error)
    return NextResponse.json({ error: "Failed to reject task" }, { status: 500 })
  }
}

