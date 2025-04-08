"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
}

export function UserSearch() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email to search for users",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to search users")
      }

      const data = await response.json()
      setUsers(data.users || [])

      if (data.users.length === 0) {
        toast({
          title: "No users found",
          description: `No users found with email containing "${email}"`,
        })
      }
    } catch (error: any) {
      console.error("Error searching users:", error)
      toast({
        title: "Error searching users",
        description: error.message || "An error occurred while searching for users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search users by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      {users.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4">
          <h3 className="text-lg font-medium mb-2">Search Results</h3>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
