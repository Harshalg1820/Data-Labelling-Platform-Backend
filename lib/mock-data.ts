import type { Task } from "./types"

export const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Bird Species Classification",
    description:
      "Label images of birds with their correct species. Each image contains one or more birds. Please draw bounding boxes around each bird and select the species from the provided list.",
    status: "available",
    reward: 0.01,
    providerId: "provider1",
    imageUrl: "/placeholder.svg?height=400&width=600",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "task2",
    title: "Street Sign Recognition",
    description:
      "Identify and label different types of street signs in urban environments. Draw tight bounding boxes around each sign and categorize them (stop, yield, speed limit, etc.).",
    status: "in_progress",
    reward: 0.015,
    providerId: "provider2",
    workerId: "current-user-id",
    imageUrl: "/placeholder.svg?height=400&width=600",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "task3",
    title: "Medical Image Segmentation",
    description:
      "Segment medical images to identify specific anatomical structures. Use the polygon tool to precisely outline each structure according to the provided guidelines.",
    status: "pending_approval",
    reward: 0.025,
    providerId: "current-user-id",
    workerId: "worker1",
    imageUrl: "/placeholder.svg?height=400&width=600",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "task4",
    title: "Facial Expression Recognition",
    description:
      "Label images with the correct facial expression (happy, sad, angry, etc.). Draw a bounding box around each face and select the appropriate emotion from the dropdown.",
    status: "completed",
    reward: 0.02,
    providerId: "current-user-id",
    workerId: "worker2",
    imageUrl: "/placeholder.svg?height=400&width=600",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "task5",
    title: "Product Image Categorization",
    description:
      "Categorize product images into appropriate categories (electronics, clothing, etc.). For each image, select the main category and up to three subcategories.",
    status: "available",
    reward: 0.012,
    providerId: "provider3",
    imageUrl: "/placeholder.svg?height=400&width=600",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "task6",
    title: "Handwriting Recognition",
    description:
      "Transcribe handwritten text from images into digital text. Draw bounding boxes around each word and provide the transcription in the text field.",
    status: "available",
    reward: 0.018,
    providerId: "current-user-id",
    imageUrl: "/placeholder.svg?height=400&width=600",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
]

