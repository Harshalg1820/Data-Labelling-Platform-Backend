import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Schema for task update
const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["AVAILABLE", "IN_PROGRESS", "PENDING_APPROVAL", "COMPLETED"]).optional(),
  reward: z.number().positive().optional(),
  workerId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        provider: {
          select: {
            walletAddress: true,
          },
        },
        worker: {
          select: {
            walletAddress: true,
          },
        },
        submission: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id
    const body = await request.json()

    // Validate request body
    const validation = updateTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
    }

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        provider: true,
        worker: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check permissions
    const isProvider = task.providerId === session.user.id
    const isWorker = task.workerId === session.user.id

    if (!isProvider && !isWorker) {
      return NextResponse.json({ error: "You do not have permission to update this task" }, { status: 403 })
    }

    // Providers can update any field
    // Workers can only update status to IN_PROGRESS or PENDING_APPROVAL
    const updateData: any = {}

    if (isProvider) {
      if (body.title) updateData.title = body.title
      if (body.description) updateData.description = body.description
      if (body.reward) updateData.reward = body.reward
      if (body.status) updateData.status = body.status
      if (body.workerId) updateData.workerId = body.workerId
    } else if (isWorker) {
      if (body.status) {
        if (body.status === "IN_PROGRESS" || body.status === "PENDING_APPROVAL") {
          updateData.status = body.status
        } else {
          return NextResponse.json(
            { error: "Workers can only update status to IN_PROGRESS or PENDING_APPROVAL" },
            { status: 403 },
          )
        }
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user is the provider
    if (task.providerId !== session.user.id) {
      return NextResponse.json({ error: "Only the task provider can delete this task" }, { status: 403 })
    }

    // Check if task can be deleted (only AVAILABLE tasks can be deleted)
    if (task.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Only available tasks can be deleted" }, { status: 400 })
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}

