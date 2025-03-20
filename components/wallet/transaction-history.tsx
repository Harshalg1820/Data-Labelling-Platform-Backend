"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Badge } from "@/components/ui/badge"

type Transaction = {
  id: string
  type: "payment" | "deposit" | "withdrawal" | "task_payment"
  amount: number
  timestamp: string
  status: "confirmed" | "pending"
  description: string
}

export function TransactionHistory() {
  const { publicKey } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return

      setIsLoading(true)

      // Simulate API call to fetch transactions
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: "tx1",
          type: "deposit",
          amount: 1.5,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          status: "confirmed",
          description: "Deposit to wallet",
        },
        {
          id: "tx2",
          type: "task_payment",
          amount: -0.05,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          status: "confirmed",
          description: "Payment for task: Bird Classification",
        },
        {
          id: "tx3",
          type: "task_payment",
          amount: -0.08,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          status: "confirmed",
          description: "Payment for task: Street Sign Recognition",
        },
        {
          id: "tx4",
          type: "withdrawal",
          amount: -0.5,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          status: "confirmed",
          description: "Withdrawal to external wallet",
        },
      ]

      setTransactions(mockTransactions)
      setIsLoading(false)
    }

    fetchTransactions()
  }, [publicKey])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 animate-pulse">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-3 w-24 bg-muted rounded"></div>
              </div>
              <div className="h-4 w-16 bg-muted rounded"></div>
            </div>
          ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{tx.description}</span>
              <Badge
                variant="outline"
                className={tx.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}
              >
                {tx.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
          </div>
          <div className={`font-medium ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
            {tx.amount > 0 ? "+" : ""}
            {tx.amount} SOL
          </div>
        </div>
      ))}
    </div>
  )
}

