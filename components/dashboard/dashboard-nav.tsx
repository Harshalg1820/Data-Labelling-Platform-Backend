"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Wallet, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserRole } from "@/hooks/use-user-role"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: Array<"provider" | "worker">
}

export function DashboardNav() {
  const pathname = usePathname()
  const { role } = useUserRole()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      href: "/dashboard/tasks",
      icon: FileText,
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Help",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ]

  return (
    <nav className="grid items-start gap-2 py-6">
      {navItems.map((item) => {
        // Skip items that are role-specific if the user doesn't have that role
        if (item.roles && role && !item.roles.includes(role)) {
          return null
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

