"use client"

import { useState } from "react"
import { useUserRole } from "@/hooks/use-user-role"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/tasks/task-list"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { mockTasks } from "@/lib/mock-data"

export default function TasksPage() {
  const { role, isLoading } = useUserRole()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Filter tasks based on role and status
  const availableTasks = mockTasks.filter((task) => task.status === "available")
  const pendingTasks = mockTasks.filter((task) =>
    role === "provider"
      ? task.status === "pending_approval"
      : task.status === "in_progress" && task.workerId === "current-user-id",
  )
  const completedTasks = mockTasks.filter((task) =>
    role === "provider"
      ? task.status === "completed" && task.providerId === "current-user-id"
      : task.status === "completed" && task.workerId === "current-user-id",
  )

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Tasks" text="Loading tasks..." />
        <div className="h-24 rounded-md border border-dashed flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tasks"
        text={role === "provider" ? "Manage your data labeling tasks" : "Find and complete labeling tasks"}
      >
        {role === "provider" && <Button onClick={() => setIsCreateDialogOpen(true)}>Create New Task</Button>}
      </DashboardHeader>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">{role === "provider" ? "My Tasks" : "Available Tasks"}</TabsTrigger>
          <TabsTrigger value="pending">{role === "provider" ? "Pending Approval" : "In Progress"}</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="space-y-4">
          <TaskList
            tasks={role === "provider" ? mockTasks.filter((t) => t.providerId === "current-user-id") : availableTasks}
            role={role}
            emptyMessage={
              role === "provider" ? "You haven't created any tasks yet." : "No tasks available at the moment."
            }
          />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <TaskList
            tasks={pendingTasks}
            role={role}
            emptyMessage={role === "provider" ? "No tasks pending approval." : "You don't have any tasks in progress."}
          />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <TaskList tasks={completedTasks} role={role} emptyMessage="No completed tasks yet." />
        </TabsContent>
      </Tabs>

      <CreateTaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </DashboardShell>
  )
}

