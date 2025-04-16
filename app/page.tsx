"use client"

import type { Location } from "@/lib/database.types"
import { Package } from "@/lib/services/search-packages"
import type { User } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardHeader } from "./dashboard/dashboard-header"
import { InterestForm } from "./dashboard/interest-form"
import { InterestsList } from "./dashboard/interests-list"
import { SearchResults } from "./dashboard/search-results"
import { SearchResultsWrapper } from "./dashboard/search-results-wrapper"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<User | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interestId, setInterestId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Record<string, any[]>>({})
  const [interestLocations, setInterestLocations] = useState<Record<string, string>>({})
  const [packages, setPackages] = useState<Package[]>([])
  const [isPackagesLoading, setIsPackagesLoading] = useState(false)
  const [basePackages, setBasePackages] = useState<Package[]>([])

  // Fetch random packages from the database
  const fetchRandomPackages = async () => {
    try {
      setIsPackagesLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("User not authenticated")
      }

      // Fetch packages directly from Supabase
      const { data: packages, error } = await supabase
        .from('travel_packages')
        .select('*')
        .limit(20)  // Fetch more to allow for random selection

      if (error) {
        console.error('Error fetching packages from Supabase:', error)
        throw new Error('Failed to fetch packages from database')
      }

      if (!packages || packages.length === 0) {
        setBasePackages([])
        return
      }

      // Shuffle the packages and return a random subset
      const shuffled = [...packages].sort(() => 0.5 - Math.random())
      const randomPackages = shuffled.slice(0, Math.min(5, shuffled.length))

      setBasePackages(randomPackages || [])
    } catch (error) {
      console.error("Error fetching random packages:", error)
    } finally {
      setIsPackagesLoading(false)
    }
  }

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

        // Fetch random packages
        fetchRandomPackages()
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

    // Scroll to section 3 (results) immediately
    const resultsSection = document.getElementById('section-3')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("User not authenticated")
      }

      // Call API directly
      const API_URL = "https://hackathon-travel-buddy-pb.fly.dev/suggest-tour"

      const response = await fetch(`${API_URL}?authorization=${encodeURIComponent(`Bearer ${session.access_token}`)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "cache-control": "no-cache",
          "pragma": "no-cache"
        },
        body: JSON.stringify({

          location_input: interest.locations_text,
          budget_input: interest.budget,
          accommodation_input: interest.accommodation,
          num_participants: 1,
          activity_input: interest.activity,
          match_count: 3
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search packages')
      }

      const data = await response.json()
      const packages = data.packages || data.data || data || []

      // Add "Created By AI" badge to one of the packages
      if (packages.length > 0) {
        packages[packages.length - 1].isAIGenerated = true;
      }

      // Replace previous results for this interest (not append)
      setSearchResults(prev => {
        const newResults = { ...prev }
        newResults[interest.id] = packages
        return newResults
      })

      setInterestLocations(prev => {
        const prev2 = { ...prev }
        prev2[interest.id] = interest.locations_text
        return prev2
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

  // Add scroll snap behavior
  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      const sections = document.querySelectorAll('section');
      let currentSection = sections[0];
      let currentSectionIndex = 0;

      // Find the current section in view
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 50 && rect.bottom >= 50) {
          currentSection = section;
          currentSectionIndex = index;
        }
      });

      // Check if section content exceeds viewport height
      const sectionHeight = currentSection.scrollHeight;
      const viewportHeight = window.innerHeight;
      const sectionScrollTop = Math.abs(currentSection.getBoundingClientRect().top);

      // If scrolling down
      if (wheelEvent.deltaY > 0) {
        console.log("scrolling down", sectionHeight, sectionScrollTop, viewportHeight)
        // If we haven't reached the bottom of the section's content yet, let normal scrolling occur
        if (sectionHeight > viewportHeight && sectionScrollTop + viewportHeight < sectionHeight) {
          return;
        }

        // Otherwise prevent default and navigate to next section
        if (currentSectionIndex < sections.length - 1) {
          e.preventDefault();
          sections[currentSectionIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
      }
      // If scrolling up
      else if (wheelEvent.deltaY < 0) {
        // If we haven't reached the top of the section's content yet, let normal scrolling occur
        if (sectionScrollTop > 0) {
          return;
        }

        // Otherwise prevent default and navigate to previous section
        if (currentSectionIndex > 0) {
          e.preventDefault();
          sections[currentSectionIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false } as AddEventListenerOptions);

    return () => {
      window.removeEventListener('wheel', handleWheel, { passive: false } as AddEventListenerOptions);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen snap-y snap-mandatory overflow-y-auto">
      {/* Section 1: Navbar and Packages Display */}
      <section id="section-1" className="min-h-screen flex flex-col snap-start">
        {user && <DashboardHeader user={user} />}

        <div className="flex-1 container mx-auto p-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-2">
              My Travel Packages
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover your curated collection of travel experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {isPackagesLoading ? (
              <div className="col-span-4 flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="col-span-12   border-gray-200 dark:border-gray-700 ">
                <div className="min-h-[200px]">
                  <SearchResults
                    results={basePackages}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Interest Form */}
      <section id="section-2" className="min-h-screen flex flex-col snap-start">
        <div className="container mx-auto p-6 flex-1">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent py-2">
              Travel Interests & Criteria
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Define your travel preferences to find your perfect journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Add New Travel Interest</h3>
              {user && <InterestForm locations={locations || []} userId={user.id} />}
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Your Travel Interests</h3>

              {user && (
                <InterestsList
                  userId={user.id}
                  initialInterests={interests}
                  onSearch={handleSearch}
                  searchingInterestId={interestId}
                />
              )}

              <div className="mt-4">
                <p className="text-gray-500 italic">
                  Define criteria needed for new packages
                </p>
                <p className="text-gray-500 mt-2">
                  → Click generate to create new packages that match your parameters
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Search Results */}
      <section id="section-3" className="min-h-screen flex flex-col snap-start">
        <div className="container mx-auto p-6 flex-1">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent py-2">
              Search Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover packages matching your criteria
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            {interestId && interests.find(i => i.id === interestId) ? (
              <SearchResultsWrapper
                results={searchResults}
                interestLocations={interestLocations}
                currentInterestId={interestId}
                interest={interests.find(i => i.id === interestId) || interests[0]}
              />
            ) : Object.keys(searchResults).length > 0 ? (
              <>
                {Object.keys(searchResults).map(id => {
                  const interest = interests.find(i => i.id === id);
                  if (!interest) return null;

                  return (
                    <div key={id} className="mb-4">
                      <SearchResultsWrapper
                        results={searchResults}
                        interestLocations={interestLocations}
                        currentInterestId={id}
                        interest={interest}
                      />
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Search for matching packages from the interest section above.</p>
                <p>Find relevant packages including an AI-generated recommendation.</p>
                <p>AI-generated packages will be highlighted with a "Created By AI" badge.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
