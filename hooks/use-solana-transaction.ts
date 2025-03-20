"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { sendPayment } from "@/lib/solana/utils"
import { useToast } from "./use-toast"

export function useSolanaTransaction() {
  const wallet = useWallet()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const sendTransaction = async (recipientAddress: string, amount: number, description: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      })
      return null
    }

    try {
      setIsProcessing(true)

      const signature = await sendPayment(wallet, recipientAddress, amount)

      toast({
        title: "Transaction successful",
        description: `Payment of ${amount} SOL sent successfully`,
      })

      return signature
    } catch (error) {
      console.error("Transaction error:", error)

      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })

      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    sendTransaction,
    isProcessing,
  }
}

