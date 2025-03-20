import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const providerActivity = [
  {
    id: "1",
    type: "task_created",
    title: "Bird Species Classification",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "task_approved",
    title: "Street Sign Recognition",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "payment_sent",
    title: "0.05 SOL to @labeler123",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "task_completed",
    title: "Medical Image Segmentation",
    timestamp: "2 days ago",
  },
]

const workerActivity = [
  {
    id: "1",
    type: "task_accepted",
    title: "Bird Species Classification",
    timestamp: "1 hour ago",
  },
  {
    id: "2",
    type: "task_submitted",
    title: "Street Sign Recognition",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    type: "payment_received",
    title: "0.05 SOL from @provider456",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "task_completed",
    title: "Medical Image Segmentation",
    timestamp: "3 days ago",
  },
]

export function RecentActivity({ role }: { role: "provider" | "worker" | null }) {
  const activities = role === "provider" ? providerActivity : workerActivity

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
              </div>
              <div className="ml-auto font-medium">
                {activity.type === "payment_received" && "+0.05 SOL"}
                {activity.type === "payment_sent" && "-0.05 SOL"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

