import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  role: "provider" | "worker" | null
  emptyMessage: string
}

export function TaskList({ tasks, role, emptyMessage }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">{emptyMessage}</p>
          {role === "provider" && (
            <Button className="mt-4" size="sm">
              Create a task
            </Button>
          )}
        </div>
      </div>
    )
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">{task.title}</CardTitle>
              <CardDescription className="text-sm">
                Created {new Date(task.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            {getStatusBadge(task.status)}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="font-medium">{task.reward} SOL</span>
              <span className="ml-1 text-muted-foreground">reward</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/dashboard/tasks/${task.id}`}>
                {role === "provider" ? "View Details" : task.status === "available" ? "Accept Task" : "View Task"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

