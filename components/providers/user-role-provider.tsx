"use client"

import type React from "react"

import { createContext, useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

type UserRole = "provider" | "worker" | null
type UserRoleContextType = {
  role: UserRole
  setRole: (role: UserRole) => void
  isLoading: boolean
}

export const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  setRole: () => {},
  isLoading: true,
})

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet()
  const [role, setRole] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!publicKey) {
        setRole(null)
        setIsLoading(false)
        return
      }

      try {
        // In a real app, this would be an API call to fetch the user's role
        // For now, we'll check localStorage or simulate a delay
        setIsLoading(true)
        const storedRole = localStorage.getItem(`user-role-${publicKey.toString()}`) as UserRole | null

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (storedRole) {
          setRole(storedRole)
        } else {
          setRole(null)
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
        setRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [publicKey])

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole)
    if (publicKey && newRole) {
      localStorage.setItem(`user-role-${publicKey.toString()}`, newRole)
    }
  }

  return (
    <UserRoleContext.Provider value={{ role, setRole: handleSetRole, isLoading }}>{children}</UserRoleContext.Provider>
  )
}

