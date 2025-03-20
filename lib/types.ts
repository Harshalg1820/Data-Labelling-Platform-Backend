export type Task = {
  id: string
  title: string
  description: string
  status: "available" | "in_progress" | "pending_approval" | "completed"
  reward: number
  providerId: string
  workerId?: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

