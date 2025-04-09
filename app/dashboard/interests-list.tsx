"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { Location, UserInterest } from "@/lib/database.types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface InterestWithLocation extends UserInterest {
  locations: Location
}

interface InterestsListProps {
  userId: string
  initialInterests: InterestWithLocation[]
}

export function InterestsList({ userId, initialInterests }: InterestsListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [interests, setInterests] = useState<InterestWithLocation[]>(initialInterests)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchInterests = async () => {
      setIsLoading(true)
      try {
        // Use the API route to fetch interests
        const response = await fetch(`/api/interests?userId=${userId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch interests")
        }

        const data = await response.json()
        setInterests(data.interests || [])
      } catch (error: any) {
        console.error("Error fetching interests:", error)
        toast({
          title: "Error fetching interests",
          description: error.message || "An error occurred while fetching your interests",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterests()
  }, [userId, toast])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/interests/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete interest")
      }

      toast({
        title: "Interest deleted",
        description: "Your travel interest has been deleted successfully.",
      })

      // Update local state
      setInterests((prev) => prev.filter((interest) => interest.id !== deleteId))
    } catch (error: any) {
      toast({
        title: "Error deleting interest",
        description: error.message || "An error occurred while deleting your interest",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (interests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        You haven&apos;t added any travel interests yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interests.map((interest) => (
        <div
          key={interest.id}
          className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {interest.locations.name}, {interest.locations.country}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Budget:</span> ${interest.budget.toLocaleString()}
                </p>
                {interest.priority_level && (
                  <p>
                    <span className="font-medium">Priority:</span> {interest.priority_level}
                  </p>
                )}
                <p>
                  <span className="font-medium">Activities:</span> {interest.activities}
                </p>
                {interest.notes && (
                  <p>
                    <span className="font-medium">Notes:</span> {interest.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(interest.id)} aria-label="Delete interest">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this travel interest. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
