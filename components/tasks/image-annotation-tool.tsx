"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

interface ImageAnnotationToolProps {
  imageUrl: string
  onSave: (annotations: Annotation[]) => void
}

const COLORS = [
  "#FF5733", // Red
  "#33FF57", // Green
  "#3357FF", // Blue
  "#FF33F5", // Pink
  "#F5FF33", // Yellow
]

export function ImageAnnotationTool({ imageUrl, onSave }: ImageAnnotationToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedTool, setSelectedTool] = useState<"box" | "point">("box")
  const [currentLabel, setCurrentLabel] = useState("")
  const [brushSize, setBrushSize] = useState(2)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [scale, setScale] = useState(1)

  // Load the image when component mounts
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      drawCanvas()
    }
  }, [imageUrl])

  // Redraw canvas when annotations change
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas()
    }
  }, [annotations, selectedAnnotation, imageLoaded, scale])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx || !imageRef.current) return

    // Set canvas dimensions to match image
    const img = imageRef.current
    canvas.width = img.width * scale
    canvas.height = img.height * scale

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Draw annotations
    annotations.forEach((annotation) => {
      const isSelected = selectedAnnotation === annotation.id

      ctx.strokeStyle = annotation.color
      ctx.lineWidth = isSelected ? brushSize + 2 : brushSize
      ctx.fillStyle = `${annotation.color}33` // Add transparency

      // Draw rectangle
      ctx.beginPath()
      ctx.rect(annotation.x * scale, annotation.y * scale, annotation.width * scale, annotation.height * scale)
      ctx.stroke()
      ctx.fill()

      // Draw label
      ctx.fillStyle = annotation.color
      ctx.font = "14px Arial"
      ctx.fillText(annotation.label, annotation.x * scale, annotation.y * scale - 5)
    })

    // Draw current annotation if drawing
    if (
      isDrawing &&
      currentAnnotation &&
      currentAnnotation.x !== undefined &&
      currentAnnotation.y !== undefined &&
      currentAnnotation.width !== undefined &&
      currentAnnotation.height !== undefined
    ) {
      ctx.strokeStyle = COLORS[annotations.length % COLORS.length]
      ctx.lineWidth = brushSize
      ctx.fillStyle = `${ctx.strokeStyle}33` // Add transparency

      ctx.beginPath()
      ctx.rect(
        currentAnnotation.x * scale,
        currentAnnotation.y * scale,
        currentAnnotation.width * scale,
        currentAnnotation.height * scale,
      )
      ctx.stroke()
      ctx.fill()
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    // Check if clicking on existing annotation
    const clicked = annotations.find(
      (ann) => x >= ann.x && x <= ann.x + ann.width && y >= ann.y && y <= ann.y + ann.height,
    )

    if (clicked) {
      setSelectedAnnotation(clicked.id)
      return
    }

    setSelectedAnnotation(null)

    if (selectedTool === "box") {
      setIsDrawing(true)
      setCurrentAnnotation({
        x,
        y,
        width: 0,
        height: 0,
        color: COLORS[annotations.length % COLORS.length],
      })
    } else if (selectedTool === "point") {
      // For point annotation, create a small box
      const pointSize = 10
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        x: x - pointSize / 2,
        y: y - pointSize / 2,
        width: pointSize,
        height: pointSize,
        label: currentLabel || `Point ${annotations.length + 1}`,
        color: COLORS[annotations.length % COLORS.length],
      }

      setAnnotations([...annotations, newAnnotation])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    if (currentAnnotation.x !== undefined && currentAnnotation.y !== undefined) {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y,
      })
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return

    // Only add if the box has some size
    if (
      currentAnnotation.width &&
      currentAnnotation.height &&
      (Math.abs(currentAnnotation.width) > 5 || Math.abs(currentAnnotation.height) > 5)
    ) {
      // Normalize negative width/height
      let { x, y, width, height } = currentAnnotation

      if (width && width < 0) {
        x = (x || 0) + width
        width = Math.abs(width)
      }

      if (height && height < 0) {
        y = (y || 0) + height
        height = Math.abs(height)
      }

      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        x: x || 0,
        y: y || 0,
        width,
        height,
        label: currentLabel || `Box ${annotations.length + 1}`,
        color: currentAnnotation.color || COLORS[0],
      }

      setAnnotations([...annotations, newAnnotation])
    }

    setIsDrawing(false)
    setCurrentAnnotation(null)
  }

  const handleDeleteAnnotation = () => {
    if (selectedAnnotation) {
      setAnnotations(annotations.filter((ann) => ann.id !== selectedAnnotation))
      setSelectedAnnotation(null)
    }
  }

  const handleSave = () => {
    onSave(annotations)
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div>
          <Label htmlFor="tool-select">Tool</Label>
          <Select value={selectedTool} onValueChange={(value: "box" | "point") => setSelectedTool(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select tool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="point">Point</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="label-input">Label</Label>
          <Input
            id="label-input"
            value={currentLabel}
            onChange={(e) => setCurrentLabel(e.target.value)}
            placeholder="Enter label"
          />
        </div>

        <div className="w-[150px]">
          <Label htmlFor="brush-size">Brush Size: {brushSize}px</Label>
          <Slider
            id="brush-size"
            min={1}
            max={10}
            step={1}
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
          />
        </div>

        <div className="flex items-end gap-1">
          <Button size="sm" onClick={handleZoomIn}>
            Zoom +
          </Button>
          <Button size="sm" onClick={handleZoomOut}>
            Zoom -
          </Button>
          <Button size="sm" variant="outline" onClick={() => setScale(1)}>
            Reset
          </Button>
        </div>
      </div>

      <div className="relative border rounded-md overflow-auto bg-checkerboard">
        <div className="relative" style={{ width: "fit-content" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p>Loading image...</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <Button variant="destructive" size="sm" onClick={handleDeleteAnnotation} disabled={!selectedAnnotation}>
            Delete Selected
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAnnotations([])} className="ml-2">
            Clear All
          </Button>
        </div>
        <Button onClick={handleSave}>Save Annotations</Button>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Annotations ({annotations.length})</h3>
        <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
          {annotations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No annotations yet</p>
          ) : (
            <ul className="space-y-1">
              {annotations.map((ann) => (
                <li
                  key={ann.id}
                  className={`text-sm p-1 rounded cursor-pointer flex items-center ${selectedAnnotation === ann.id ? "bg-muted" : ""}`}
                  onClick={() => setSelectedAnnotation(ann.id)}
                >
                  <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: ann.color }} />
                  <span>{ann.label}</span>
                  <span className="text-muted-foreground ml-2">
                    ({Math.round(ann.x)}, {Math.round(ann.y)}) {Math.round(ann.width)}×{Math.round(ann.height)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

