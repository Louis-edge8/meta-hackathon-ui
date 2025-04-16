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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { Location, UserInterest } from "@/lib/database.types"
import type { Package } from "@/lib/services/search-packages"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface InterestWithLocations extends UserInterest {
  locations: Location[]
}

interface InterestsListProps {
  userId: string
  initialInterests: InterestWithLocations[]
  onSearch?: (interest: InterestWithLocations) => Promise<void>
  searchingInterestId?: string | null
}

export function InterestsList({ userId, initialInterests, onSearch, searchingInterestId: externalSearchingId }: InterestsListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [interests, setInterests] = useState<InterestWithLocations[]>(initialInterests)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchingInterestId, setSearchingInterestId] = useState<string | null>(null)
  const [expandedInterestId, setExpandedInterestId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Record<string, Package[]>>({})
  const [interestLocations, setInterestLocations] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchInterests = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/interests?userId=${userId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch interests")
        }

        const data = await response.json()

        // Fetch locations for each interest
        const interestsWithLocations = await Promise.all(
          data.interests.map(async (interest: UserInterest) => {
            if (interest.locations_id.length > 0) {
              const { data: locations } = await supabase
                .from('locations')
                .select('*')
                .in('id', interest.locations_id);

              return {
                ...interest,
                locations: locations || []
              };
            }
            return {
              ...interest,
              locations: []
            };
          })
        );

        setInterests(interestsWithLocations)
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
  }, [userId, toast, supabase])

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

      setInterests((prev) => prev.filter((interest) => interest.id !== deleteId))
      setSearchResults((prev) => {
        const newResults = { ...prev }
        delete newResults[deleteId]
        return newResults
      })
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

  const handleSearch = async (interest: InterestWithLocations) => {
    setSearchingInterestId(interest.id);
    try {
      console.log('Interest being searched:', interest)

      // Scroll to results immediately for better user experience
      const resultsSection = document.getElementById('search-results-section')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (onSearch) {
        // Use the parent component's search handler if provided
        await onSearch(interest);
        setTimeout(() => {
          setSearchingInterestId(null);
        }, 1000);
      } else {
        // Fallback to the original event dispatch method
        const searchEvent = new CustomEvent('search-interest', {
          detail: { interest }
        });
        window.dispatchEvent(searchEvent);

        // Keep search button in loading state for a short period
        setTimeout(() => {
          setSearchingInterestId(null);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error triggering search:", error);
      toast({
        title: "Error",
        description: "Failed to trigger search",
        variant: "destructive",
      });
      setSearchingInterestId(null);
    }
  };

  const toggleExpand = (interestId: string) => {
    setExpandedInterestId((prev) => (prev === interestId ? null : interestId));
  };

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
    <>
      <div className="space-y-4 h-[500px] overflow-y-auto overscroll-contain pr-2">
        <div className="space-y-4">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="bg-gray-200/20 dark:bg-gray-800 p-3 rounded-md border border-gray-300 dark:border-gray-700"
            >
              <div className="flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {interest.locations.map((location) => (
                    <Badge key={location.id} variant="default" className="text-xs">
                      {location.name}
                    </Badge>
                  ))}
                  {interest.locations_text.split(" | ").map((location, index) => {
                    // Skip locations that are already shown as badges
                    if (interest.locations.some(loc => `${loc.name}, ${loc.country}` === location)) {
                      return null;
                    }
                    return (
                      <Badge key={`custom-${index}`} variant="secondary" className="text-xs">
                        {location}
                      </Badge>
                    );
                  })}
                </div>
                <div className="space-y-0.5 text-sm">
                  <p>
                    <span className="font-medium">Budget:</span> ${interest.budget.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {interest.duration} days
                  </p>
                  <p>
                    <span className="font-medium">Activities:</span> {interest.activities}
                  </p>
                  {interest.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {interest.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs py-1 h-7"
                    onClick={() => handleSearch(interest)}
                    disabled={searchingInterestId === interest.id || externalSearchingId === interest.id}
                  >
                    {(searchingInterestId === interest.id || externalSearchingId === interest.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    Search
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs py-1 h-7"
                    onClick={() => setDeleteId(interest.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Travel Interest</AlertDialogTitle>
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
    </>
  )
}
