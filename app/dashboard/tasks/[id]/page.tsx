"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TaskLabelingInterface } from "@/components/tasks/task-labeling-interface"
import { TaskApprovalInterface } from "@/components/tasks/task-approval-interface"
import { ApproveTaskDialog } from "@/components/tasks/approve-task-dialog"
import { mockTasks } from "@/lib/mock-data"

export default function TaskDetailPage() {
  const params = useParams()
  const { role, isLoading } = useUserRole()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

  // Find task by ID from mock data
  const taskId = params.id as string
  const task = mockTasks.find((t) => t.id === taskId)

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Task Details" text="Loading task details..." />
        <div className="h-24 rounded-md border border-dashed flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardShell>
    )
  }

  if (!task) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Task Not Found" text="The requested task could not be found." />
        <div className="h-24 rounded-md border border-dashed flex items-center justify-center">
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </DashboardShell>
    )
  }

  const handleSubmitLabeling = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    toast({
      title: "Task submitted",
      description: "Your labeling has been submitted for review.",
    })
  }

  const handleApproveTask = async () => {
    setIsApproveDialogOpen(true)
  }

  const handleTaskApproved = () => {
    toast({
      title: "Task approved",
      description: "The task has been approved and payment has been sent.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Available
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            In Progress
          </Badge>
        )
      case "pending_approval":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Pending Approval
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={task.title} text={`Task ID: ${task.id}`} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{task.title}</CardTitle>
            {getStatusBadge(task.status)}
          </div>
          <CardDescription>Created on {new Date(task.createdAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Reward</h3>
            <p className="text-sm text-muted-foreground mt-1">{task.reward} SOL</p>
          </div>

          <Separator />

          {role === "worker" && task.status === "available" && (
            <TaskLabelingInterface task={task} onSubmit={handleSubmitLabeling} isSubmitting={isSubmitting} />
          )}

          {role === "provider" && task.status === "pending_approval" && (
            <TaskApprovalInterface task={task} onApprove={handleApproveTask} isApproving={false} />
          )}

          {(task.status === "completed" ||
            (role === "worker" && task.status === "pending_approval") ||
            (role === "provider" && task.status === "in_progress")) && (
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium mb-2">Task Submission</h3>
              <div className="aspect-video bg-background rounded-md border flex items-center justify-center">
                <p className="text-muted-foreground">Submission preview would appear here</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Back to Tasks</Button>

          {role === "worker" && task.status === "available" && <Button>Accept Task</Button>}
        </CardFooter>
      </Card>

      <ApproveTaskDialog
        task={task}
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onApproved={handleTaskApproved}
      />
    </DashboardShell>
  )
}

