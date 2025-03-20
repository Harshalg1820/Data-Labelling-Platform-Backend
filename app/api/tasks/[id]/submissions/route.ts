import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { uploadJSONToIPFS } from "@/lib/ipfs/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Schema for submission creation
const createSubmissionSchema = z.object({
  annotations: z.array(
    z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      label: z.string(),
      color: z.string(),
    }),
  ),
  notes: z.string().optional(),
  resultImageBase64: z.string().optional(),
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
    const validation = createSubmissionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
    }

    const { annotations, notes, resultImageBase64 } = validation.data

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if task is available or in progress
    if (task.status !== "AVAILABLE" && task.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Task is not available for submission" }, { status: 400 })
    }

    // Check if user is a worker
    if (session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can submit tasks" }, { status: 403 })
    }

    // Upload annotations to IPFS
    const submissionData = {
      annotations,
      notes,
      taskId,
      workerId: session.user.id,
      timestamp: new Date().toISOString(),
    }

    const ipfsCid = await uploadJSONToIPFS(submissionData)

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        taskId,
        annotations: JSON.stringify(annotations),
        notes: notes || "",
        ipfsCid,
        resultUrl: resultImageBase64 ? resultImageBase64 : null,
      },
    })

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "PENDING_APPROVAL",
        workerId: session.user.id,
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id

    // Get submission for task
    const submission = await prisma.submission.findUnique({
      where: { taskId },
      include: {
        task: {
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
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}

