"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TransactionProcessor } from "@/components/solana/transaction-processor"
import type { Task } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ApproveTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onApproved: () => void
}

export function ApproveTaskDialog({ task, open, onOpenChange, onApproved }: ApproveTaskDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<"confirm" | "payment">("confirm")

  const handleConfirm = () => {
    setStep("payment")
  }

  const handlePaymentSuccess = (signature: string) => {
    toast({
      title: "Payment successful",
      description: "The task has been approved and payment sent.",
    })

    // In a real app, you would update the task status in your database
    setTimeout(() => {
      onApproved()
      onOpenChange(false)
      setStep("confirm")
    }, 2000)
  }

  const handlePaymentError = (error: Error) => {
    toast({
      title: "Payment failed",
      description: error.message,
      variant: "destructive",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{step === "confirm" ? "Approve Task" : "Process Payment"}</DialogTitle>
          <DialogDescription>
            {step === "confirm"
              ? "Are you sure you want to approve this task and release payment?"
              : "Complete the payment to approve the task."}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" ? (
          <>
            <div className="py-4">
              <div className="rounded-md border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Task:</span>
                  <span className="text-sm">{task.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Labeler:</span>
                  <span className="text-sm">@{task.workerId || "worker123"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Payment Amount:</span>
                  <span className="text-sm">{task.reward} SOL</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                By approving this task, you confirm that the labeling meets your requirements and agree to release the
                payment to the labeler.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Proceed to Payment</Button>
            </DialogFooter>
          </>
        ) : (
          <TransactionProcessor
            recipientAddress={task.workerId || "8xxa1Bphn5qz8NKQ1bXQoJPqvbPJLQsGtpwKgfRUBB1D"}
            amount={task.reward}
            description={`Payment for task: ${task.title}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

