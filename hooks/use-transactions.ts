"use client"

import { useState, useEffect } from "react"
import { useToast } from "./use-toast"

export function useTransactions(walletAddress?: string) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query string
      const queryParams = new URLSearchParams()
      if (walletAddress) queryParams.append("walletAddress", walletAddress)

      const response = await fetch(`/api/transactions?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch transactions")
      }

      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")

      toast({
        title: "Error fetching transactions",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch transactions on mount and when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchTransactions()
    }
  }, [walletAddress])

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
  }
}

