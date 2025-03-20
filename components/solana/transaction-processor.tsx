"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { sendPayment } from "@/lib/solana/program"

interface TransactionProcessorProps {
  recipientAddress: string
  amount: number
  description: string
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
}

enum TransactionStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

export function TransactionProcessor({
  recipientAddress,
  amount,
  description,
  onSuccess,
  onError,
}: TransactionProcessorProps) {
  const wallet = useWallet()
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE)
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendPayment = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Wallet not connected")
      setStatus(TransactionStatus.ERROR)
      return
    }

    try {
      setStatus(TransactionStatus.PROCESSING)

      const txSignature = await sendPayment(wallet, recipientAddress, amount)

      setSignature(txSignature)
      setStatus(TransactionStatus.SUCCESS)
      onSuccess?.(txSignature)
    } catch (err) {
      console.error("Transaction error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setStatus(TransactionStatus.ERROR)
      onError?.(err instanceof Error ? err : new Error("Unknown error occurred"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Confirmation</CardTitle>
        <CardDescription>Confirm the payment details before proceeding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Recipient:</span>
          <span className="text-sm font-mono">
            {recipientAddress.slice(0, 4)}...{recipientAddress.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Amount:</span>
          <span className="text-sm">{amount} SOL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Description:</span>
          <span className="text-sm">{description}</span>
        </div>

        {status === TransactionStatus.SUCCESS && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Transaction signature:
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline font-mono text-xs"
              >
                {signature?.slice(0, 8)}...{signature?.slice(-8)}
              </a>
            </AlertDescription>
          </Alert>
        )}

        {status === TransactionStatus.ERROR && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>{error || "An error occurred while processing the payment."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {status === TransactionStatus.IDLE && (
          <Button onClick={handleSendPayment} className="w-full" disabled={!wallet.connected}>
            Confirm Payment
          </Button>
        )}

        {status === TransactionStatus.PROCESSING && (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
        )}

        {status === TransactionStatus.SUCCESS && (
          <Button variant="outline" className="w-full" onClick={() => setStatus(TransactionStatus.IDLE)}>
            Make Another Payment
          </Button>
        )}

        {status === TransactionStatus.ERROR && (
          <Button variant="outline" className="w-full" onClick={() => setStatus(TransactionStatus.IDLE)}>
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

