import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const type = searchParams.get("type")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10

    // Build query
    const where: any = {}

    // Filter by wallet address (from or to)
    if (walletAddress) {
      where.OR = [{ fromAddress: walletAddress }, { toAddress: walletAddress }]
    }

    // Filter by transaction type
    if (type) {
      where.type = type.toUpperCase()
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

