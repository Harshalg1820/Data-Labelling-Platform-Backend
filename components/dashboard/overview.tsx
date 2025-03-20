"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const providerData = [
  {
    name: "Jan",
    total: 12,
  },
  {
    name: "Feb",
    total: 18,
  },
  {
    name: "Mar",
    total: 24,
  },
  {
    name: "Apr",
    total: 32,
  },
  {
    name: "May",
    total: 28,
  },
  {
    name: "Jun",
    total: 36,
  },
]

const workerData = [
  {
    name: "Jan",
    total: 8,
  },
  {
    name: "Feb",
    total: 14,
  },
  {
    name: "Mar",
    total: 22,
  },
  {
    name: "Apr",
    total: 30,
  },
  {
    name: "May",
    total: 42,
  },
  {
    name: "Jun",
    total: 38,
  },
]

export function Overview({ role }: { role: "provider" | "worker" | null }) {
  const data = role === "provider" ? providerData : workerData

  return (
    <Card>
      <CardHeader>
        <CardTitle>{role === "provider" ? "Tasks Created" : "Tasks Completed"}</CardTitle>
        <CardDescription>
          {role === "provider" ? "Number of tasks created per month" : "Number of tasks completed per month"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

