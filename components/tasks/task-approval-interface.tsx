"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

interface TaskApprovalInterfaceProps {
  task: Task
  onApprove: () => Promise<void>
  isApproving: boolean
}

export function TaskApprovalInterface({ task, onApprove, isApproving }: TaskApprovalInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")

  // Mock annotations - in a real app, these would come from the submission
  useEffect(() => {
    setAnnotations([
      {
        id: "1",
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        label: "Object 1",
        color: "#FF5733",
      },
      {
        id: "2",
        x: 200,
        y: 150,
        width: 80,
        height: 120,
        label: "Object 2",
        color: "#33FF57",
      },
    ])
  }, [])

  // Draw the canvas with annotations
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = task.imageUrl || "/placeholder.svg?height=400&width=600"

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0)

      // Draw annotations
      annotations.forEach((ann) => {
        ctx.strokeStyle = ann.color
        ctx.lineWidth = 2
        ctx.fillStyle = `${ann.color}33` // Add transparency

        // Draw rectangle
        ctx.beginPath()
        ctx.rect(ann.x, ann.y, ann.width, ann.height)
        ctx.stroke()
        ctx.fill()

        // Draw label
        ctx.fillStyle = ann.color
        ctx.font = "14px Arial"
        ctx.fillText(ann.label, ann.x, ann.y - 5)
      })

      setImageLoaded(true)
    }
  }, [annotations, task.imageUrl])

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Submission Preview</TabsTrigger>
          <TabsTrigger value="details">Submission Details</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4 pt-4">
          <div className="rounded-md bg-muted/30 p-4">
            <h3 className="font-medium mb-2">Annotated Image</h3>
            <div className="relative border rounded-md overflow-hidden bg-checkerboard">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <p>Loading image...</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Annotations ({annotations.length})</h3>
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
              {annotations.map((ann) => (
                <div key={ann.id} className="text-sm p-1 flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: ann.color }} />
                  <span>{ann.label}</span>
                  <span className="text-muted-foreground ml-2">
                    ({Math.round(ann.x)}, {Math.round(ann.y)}) {Math.round(ann.width)}×{Math.round(ann.height)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="flex flex-col space-y-2 rounded-md border p-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Labeler:</span>
              <span className="text-sm">@{task.workerId || "worker123"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Submitted:</span>
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Time Spent:</span>
              <span className="text-sm">32 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Annotations:</span>
              <span className="text-sm">{annotations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Payment Amount:</span>
              <span className="text-sm">{task.reward} SOL</span>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="text-sm font-medium mb-2">Labeler Notes</h3>
            <p className="text-sm text-muted-foreground">
              I've identified and labeled all the objects in the image according to the instructions. There were some
              partially obscured objects that I've marked as well.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Request Changes
        </Button>
        <Button onClick={onApprove} disabled={isApproving} className="flex-1">
          {isApproving ? "Processing Payment..." : "Approve & Pay"}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Pending Approval
          </Badge>
        </div>
        <p className="text-muted-foreground">Task ID: {task.id}</p>
      </div>
    </div>
  )
}

