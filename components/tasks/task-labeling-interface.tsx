"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageAnnotationTool } from "./image-annotation-tool"
import type { Task } from "@/lib/types"

interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

interface TaskLabelingInterfaceProps {
  task: Task
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export function TaskLabelingInterface({ task, onSubmit, isSubmitting }: TaskLabelingInterfaceProps) {
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeTab, setActiveTab] = useState("annotate")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSaveAnnotations = (newAnnotations: Annotation[]) => {
    setAnnotations(newAnnotations)
  }

  const handleSubmitTask = async () => {
    // In a real app, you would upload the annotations and file to your backend
    // and then call the onSubmit function
    await onSubmit()
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="annotate">Annotate Image</TabsTrigger>
          <TabsTrigger value="details">Task Details</TabsTrigger>
        </TabsList>

        <TabsContent value="annotate" className="space-y-4 pt-4">
          <div className="rounded-md bg-muted/30 p-4">
            <h3 className="font-medium mb-2">Task Image</h3>
            <ImageAnnotationTool
              imageUrl={task.imageUrl || "/placeholder.svg?height=400&width=600"}
              onSave={handleSaveAnnotations}
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="rounded-md bg-muted/30 p-4">
            <h3 className="font-medium mb-2">Task Description</h3>
            <p className="text-sm">{task.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about your submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result-file">Upload Result (if applicable)</Label>
            <Input id="result-file" type="file" onChange={handleFileChange} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab(activeTab === "annotate" ? "details" : "annotate")}>
          {activeTab === "annotate" ? "Next: Task Details" : "Back to Annotation"}
        </Button>

        <Button onClick={handleSubmitTask} disabled={isSubmitting || annotations.length === 0}>
          {isSubmitting ? "Submitting..." : "Submit Task"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Reward: {task.reward} SOL</p>
        <p>Annotations: {annotations.length}</p>
      </div>
    </div>
  )
}

