"use client"

import { useContext } from "react"
import { UserRoleContext } from "@/components/providers/user-role-provider"

export function useUserRole() {
  const context = useContext(UserRoleContext)

  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider")
  }

  return context
}

