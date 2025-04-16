"use client"

import type { Location } from "@/lib/database.types"
import type { User } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { InterestForm } from "./interest-form"
import { InterestsList } from "./interests-list"
import { SearchResultsWrapper } from "./search-results-wrapper"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<User | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interestId, setInterestId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Record<string, any[]>>({})
  const [interestLocations, setInterestLocations] = useState<Record<string, string>>({})

  // Check auth and fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/login")
          return
        }

        setUser(authUser)

        // Fetch locations
        const { data: locationsData } = await supabase
          .from("locations")
          .select("*")
          .order("name")

        setLocations(locationsData || [])

        // Fetch interests
        const response = await fetch(`/api/interests?userId=${authUser.id}`)

        if (response.ok) {
          const data = await response.json()

          // Fetch locations for each interest if needed
          const interestsWithLocations = await Promise.all(
            data.interests.map(async (interest: any) => {
              if (interest.locations_id.length > 0) {
                const { data: locData } = await supabase
                  .from('locations')
                  .select('*')
                  .in('id', interest.locations_id)

                return {
                  ...interest,
                  locations: locData || []
                }
              }
              return {
                ...interest,
                locations: []
              }
            })
          )

          setInterests(interestsWithLocations)
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  // Handle search
  const handleSearch = async (interest: any) => {
    if (!interest) return

    // Set the interest ID being searched
    setInterestId(interest.id)

    // Scroll to results section immediately
    const resultsSection = document.getElementById('search-results-section')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("User not authenticated")
      }

      // Call API directly since searchPackages is a server component function
      const API_URL = "https://hackathon-travel-buddy-pb.onrender.com/search-travel-packages"

      const response = await fetch(`${API_URL}?authorization=${encodeURIComponent(`Bearer ${session.access_token}`)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "cache-control": "no-cache",
          "pragma": "no-cache"
        },
        body: JSON.stringify({ ...interest, match_count: 3 }),
      });

      if (!response.ok) {
        throw new Error('Failed to search packages')
      }

      const data = await response.json()
      const packages = data.packages || data.data || data || []

      // Replace previous results for this interest (not append)
      setSearchResults(prev => {
        const newResults = { ...prev }
        newResults[interest.id] = packages
        return newResults
      })

      setInterestLocations(prev => {
        const newLocations = { ...prev }
        newLocations[interest.id] = interest.locations_text
        return newLocations
      })

    } catch (error) {
      console.error('Error searching packages:', error)
    } finally {
      // Ensure interestId is set to null after search completes to stop the spinner
      setTimeout(() => {
        setInterestId(null)
      }, 500)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <main className="flex-1 container mx-auto px-4 pb-8">
      <div className="grid gap-8 border-2 border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12">
          <div className="col-span-6 space-y-6 border-r-2 border-gray-200 dark:border-gray-700">
            <div className="py-6 px-8">
              <h2 className="text-xl font-semibold mb-4">Add New Travel Interest</h2>
              {user && <InterestForm locations={locations || []} userId={user.id} />}
            </div>
          </div>
          <div className="col-span-6 space-y-6">
            <div className="py-6 px-8">
              <h2 className="text-xl font-semibold mb-4">Your Travel Interests</h2>
              {user && <InterestsList
                userId={user.id}
                initialInterests={interests}
                onSearch={handleSearch}
                searchingInterestId={interestId}
              />}
            </div>
          </div>

          <div className="col-span-12 border-t-2 border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="min-h-[200px]">
              <SearchResultsWrapper
                results={searchResults}
                interest={interests.find(interest => interest.id === interestId)}
                interestLocations={interestLocations}
                currentInterestId={interestId}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
