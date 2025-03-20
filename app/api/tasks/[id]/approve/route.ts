import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PublicKey } from "@solana/web3.js"

// Schema for approval
const approvalSchema = z.object({
  txSignature: z.string().optional(),
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
    const validation = approvalSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
    }

    const { txSignature } = validation.data

    // Get task with submission
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        provider: true,
        worker: true,
        submission: true,
      },
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
      return NextResponse.json({ error: "Only the task provider can approve this task" }, { status: 403 })
    }

    // If no transaction signature provided, create one
    let signature = txSignature
    if (!signature && task.worker && task.worker.walletAddress) {
      try {
        // In a real app, you would use a server wallet to send the payment
        // This is a simplified example
        const workerPublicKey = new PublicKey(task.worker.walletAddress)

        // This would be replaced with actual server wallet logic
        // signature = await createServerTransaction(serverKeypair, workerPublicKey, task.reward)

        // For demo purposes, we'll just generate a fake signature
        signature = `demo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      } catch (error) {
        console.error("Error creating payment transaction:", error)
        return NextResponse.json({ error: "Failed to create payment transaction" }, { status: 500 })
      }
    }

    // Update submission with transaction signature
    await prisma.submission.update({
      where: { taskId },
      data: {
        txSignature: signature,
      },
    })

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        type: "TASK_PAYMENT",
        amount: task.reward,
        status: "CONFIRMED",
        txSignature: signature || "manual_approval",
        fromAddress: task.provider.walletAddress,
        toAddress: task.worker?.walletAddress || "unknown",
        description: `Payment for task: ${task.title}`,
      },
    })

    return NextResponse.json({
      success: true,
      txSignature: signature,
    })
  } catch (error) {
    console.error("Error approving task:", error)
    return NextResponse.json({ error: "Failed to approve task" }, { status: 500 })
  }
}

