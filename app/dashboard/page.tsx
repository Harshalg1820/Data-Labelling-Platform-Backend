"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useUserRole } from "@/hooks/use-user-role"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UserRoleSelector } from "@/components/dashboard/user-role-selector"

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const { role, isLoading } = useUserRole()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    // This would be replaced with actual Solana RPC call to get balance
    const fetchBalance = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setWalletBalance(Math.random() * 10)
    }

    if (publicKey) {
      fetchBalance()
    }
  }, [publicKey])

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Dashboard" text="Loading your dashboard..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-muted/50" />
                <CardContent className="h-24 bg-muted/30" />
              </Card>
            ))}
        </div>
      </DashboardShell>
    )
  }

  if (!role) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Welcome to DataLabel" text="Please select your role to get started." />
        <UserRoleSelector />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={role === "provider" ? "Data Provider Dashboard" : "Labeler Dashboard"}
        text={role === "provider" ? "Manage your data labeling tasks" : "Find and complete labeling tasks"}
      >
        <Button>{role === "provider" ? "Create New Task" : "Find Tasks"}</Button>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === "provider" ? "Active Tasks" : "Completed Tasks"}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role === "provider" ? "12" : "48"}</div>
            <p className="text-xs text-muted-foreground">
              {role === "provider" ? "+2 since last week" : "+10 since last week"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === "provider" ? "Pending Approvals" : "Available Tasks"}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role === "provider" ? "7" : "24"}</div>
            <p className="text-xs text-muted-foreground">
              {role === "provider" ? "+3 since yesterday" : "+5 since yesterday"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === "provider" ? "Total Spent" : "Total Earned"}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role === "provider" ? "1.2 SOL" : "0.8 SOL"}</div>
            <p className="text-xs text-muted-foreground">
              {role === "provider" ? "+0.2 SOL since last month" : "+0.15 SOL since last month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6 space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview role={role} />
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <RecentActivity role={role} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

