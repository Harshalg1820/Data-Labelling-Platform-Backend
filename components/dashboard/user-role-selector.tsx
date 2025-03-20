"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Database, Image } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserRole } from "@/hooks/use-user-role"
import { useToast } from "@/hooks/use-toast"

export function UserRoleSelector() {
  const { setRole } = useUserRole()
  const router = useRouter()
  const { toast } = useToast()
  const [isSelecting, setIsSelecting] = useState(false)

  const handleSelectRole = async (selectedRole: "provider" | "worker") => {
    setIsSelecting(true)

    // Simulate API call to set user role
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setRole(selectedRole)
    setIsSelecting(false)

    toast({
      title: "Role selected",
      description: `You are now a ${selectedRole === "provider" ? "Data Provider" : "Labeler"}.`,
    })

    router.push("/dashboard")
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Provider
          </CardTitle>
          <CardDescription>Upload images and tasks for labeling</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Upload images for labeling</li>
            <li>Set rewards for completed tasks</li>
            <li>Review and approve submissions</li>
            <li>Build high-quality datasets</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => handleSelectRole("provider")} disabled={isSelecting}>
            {isSelecting ? "Selecting..." : "Select as Provider"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Labeler
          </CardTitle>
          <CardDescription>Complete labeling tasks and earn SOL</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Browse available labeling tasks</li>
            <li>Complete tasks at your own pace</li>
            <li>Earn SOL for each completed task</li>
            <li>Build your reputation as a labeler</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => handleSelectRole("worker")} disabled={isSelecting}>
            {isSelecting ? "Selecting..." : "Select as Labeler"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

