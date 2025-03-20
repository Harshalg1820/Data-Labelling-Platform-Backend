"use client"

import { useState, useEffect } from "react"
import { useToast } from "./use-toast"
import type { Task } from "@/lib/types"

export function useTasks(initialFilters?: {
  status?: string
  providerId?: string
  workerId?: string
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(initialFilters || {})
  const { toast } = useToast()

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query string
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.providerId) queryParams.append("providerId", filters.providerId)
      if (filters.workerId) queryParams.append("workerId", filters.workerId)

      const response = await fetch(`/api/tasks?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")

      toast({
        title: "Error fetching tasks",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (taskData: {
    title: string
    description: string
    reward: number
    providerId: string
    imageBase64?: string
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create task")
      }

      const newTask = await response.json()

      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      })

      // Refresh tasks
      fetchTasks()

      return newTask
    } catch (err) {
      console.error("Error creating task:", err)

      toast({
        title: "Error creating task",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })

      return null
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update task")
      }

      const updatedTask = await response.json()

      toast({
        title: "Task updated",
        description: "Task status has been updated successfully",
      })

      // Update local tasks
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)))

      return updatedTask
    } catch (err) {
      console.error("Error updating task:", err)

      toast({
        title: "Error updating task",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })

      return null
    }
  }

  const submitTaskLabeling = async (
    taskId: string,
    data: {
      annotations: any[]
      notes?: string
      resultImageBase64?: string
    },
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit task")
      }

      const submission = await response.json()

      toast({
        title: "Task submitted",
        description: "Your labeling has been submitted for review",
      })

      // Update local tasks
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "PENDING_APPROVAL" } : task)))

      return submission
    } catch (err) {
      console.error("Error submitting task:", err)

      toast({
        title: "Error submitting task",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })

      return null
    }
  }

  const approveTask = async (taskId: string, txSignature?: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txSignature }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to approve task")
      }

      const result = await response.json()

      toast({
        title: "Task approved",
        description: "The task has been approved and payment sent",
      })

      // Update local tasks
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "COMPLETED" } : task)))

      return result
    } catch (err) {
      console.error("Error approving task:", err)

      toast({
        title: "Error approving task",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })

      return null
    }
  }

  const rejectTask = async (taskId: string, reason: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject task")
      }

      const result = await response.json()

      toast({
        title: "Task rejected",
        description: "The task has been rejected and returned to the available pool",
      })

      // Update local tasks
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "AVAILABLE", workerId: null } : task)))

      return result
    } catch (err) {
      console.error("Error rejecting task:", err)

      toast({
        title: "Error rejecting task",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })

      return null
    }
  }

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks()
  }, [JSON.stringify(filters)])

  return {
    tasks,
    isLoading,
    error,
    setFilters,
    fetchTasks,
    createTask,
    updateTaskStatus,
    submitTaskLabeling,
    approveTask,
    rejectTask,
  }
}

