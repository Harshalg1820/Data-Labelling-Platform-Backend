import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { uploadToIPFS, cidToIpfsUrl } from "@/lib/ipfs/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Schema for task creation
const createTaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  reward: z.number().positive(),
  providerId: z.string().uuid(),
  imageBase64: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a provider
    if (session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Only providers can create tasks" }, { status: 403 })
    }

    const body = await request.json()

    // Validate request body
    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
    }

    const { title, description, reward, providerId, imageBase64 } = validation.data

    // Upload image to IPFS if provided
    let ipfsCid = ""
    let imageUrl = ""

    if (imageBase64) {
      // Convert base64 to buffer
      const buffer = Buffer.from(imageBase64.split(",")[1], "base64")

      // Upload to IPFS
      ipfsCid = await uploadToIPFS(buffer)
      imageUrl = cidToIpfsUrl(ipfsCid)
    }

    // Create task in database
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: "AVAILABLE",
        reward,
        imageUrl,
        ipfsCid,
        providerId,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const providerId = searchParams.get("providerId")
    const workerId = searchParams.get("workerId")

    // Build query
    const where: any = {}

    if (status) {
      where.status = status.toUpperCase()
    }

    if (providerId) {
      where.providerId = providerId
    }

    if (workerId) {
      where.workerId = workerId
    }

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

