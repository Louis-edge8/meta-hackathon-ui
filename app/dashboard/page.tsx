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

      // Transform mock data to match expected Package format
      const mockPackages = [
        {
          id: 'mock-1',
          title: "Classic Ha Long Bay Cruise Experience",
          description: "Embark on a traditional junk boat cruise through Ha Long Bay's limestone karsts. Enjoy kayaking, cave exploration, and fresh seafood dining with stunning sunset views.",
          duration: 3,
          price: 450.0,
          accommodation: [{
            name: "Traditional Junk Boat Cabin",
            type: "Cruise Ship",
            description: "Comfortable cabin with traditional Vietnamese decor, private bathroom, and ocean views",
            price_range: "$150-200 per night"
          }],
          isAIGenerated: false,
          location_input: interest.locations_text,
          activities: "Cave exploration, kayaking, cooking class, sunset viewing, swimming"
        },
        {
          id: 'mock-2',
          title: "Ha Long Bay Ultimate Adventure & Luxury Experience",
          description: "AI-curated journey combining adventure and luxury in Ha Long Bay. Features exclusive access to hidden caves, private seaplane tour, luxury cruise accommodation, and personalized cultural experiences.",
          duration: 4,
          price: 899.0,
          accommodation: [{
            name: "Premium Paradise Luxury Cruise",
            type: "Luxury Cruise",
            description: "5-star cruise ship with premium suites, private balconies, spa facilities, and gourmet dining options",
            price_range: "$300-400 per night"
          }],
          isAIGenerated: true,
          location_input: interest.locations_text,
          activities: "Seaplane tour, private cave exploration, luxury spa treatments, gourmet cooking class, night squid fishing, sunrise tai chi"
        },
        {
          id: 'mock-3',
          title: "Ha Long Bay Family Adventure Package",
          description: "Perfect for families! Explore Ha Long Bay with kid-friendly activities, educational tours, and comfortable family-sized accommodations. Includes special children's programs and family bonding experiences.",
          duration: 3,
          price: 599.0,
          accommodation: [{
            name: "Family Suite - Era Cruises",
            type: "Cruise Ship",
            description: "Spacious family suite with connecting rooms, child-safety features, and family amenities",
            price_range: "$250-300 per night"
          }],
          isAIGenerated: false,
          location_input: interest.locations_text,
          activities: "Family kayaking, kid's cooking class, beach picnics, educational cave tours, family movie nights"
        }
      ];

      // Replace previous results for this interest (not append)
      setSearchResults(prev => {
        const newResults = { ...prev }
        newResults[interest.id] = mockPackages
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
