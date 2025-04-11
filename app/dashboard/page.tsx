import type { Location } from "@/lib/database.types"
import { getUserInterestsWithLocations } from "@/lib/services/interests"
import { searchPackages } from "@/lib/services/search-packages"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { InterestForm } from "./interest-form"
import { InterestsList } from "./interests-list"
import { SearchResultsWrapper } from "./search-results-wrapper"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is authenticated using getUser() for better security
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Fetch locations for the dropdown
  const { data: locations } = await supabase.from("locations").select("*").order("name")

  // Fetch user interests with locations using the service function
  const interests = await getUserInterestsWithLocations(user.id)
  console.log('Fetched interests:', interests)

  // Handle search parameter
  let searchResults = {}
  let interestLocations = {}

  const interestId = searchParams.interest_id as string
  console.log('Search params:', searchParams)
  console.log('Interest ID from URL:', interestId)

  if (interestId && interests) {
    // Find the interest
    const interest = interests.find(i => i.id === interestId)
    console.log('Found interest:', interest)

    if (interest) {
      try {
        const searchParams = {
          location_input: interest.locations_text,
          budget_input: interest.budget.toString(),
          activities_input: interest.activities,
          notes_input: interest.notes || "",
          match_count: 3,
        }
        console.log('Making API call with params:', searchParams)

        // Call the search packages API
        const packages = await searchPackages(searchParams)
        console.log('Received packages:', packages)

        searchResults = {
          [interestId]: packages
        }

        interestLocations = {
          [interestId]: interest.locations_text
        }
      } catch (error: any) {
        console.error('Error searching packages:', error)
        // You might want to show this error to the user
      }
    } else {
      console.error('No interest found with ID:', interestId)
    }
  } else {
    console.log('No interest ID in URL or no interests found')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 container mx-auto px-4 pb-8">
        <div className="grid gap-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-12">
            <div className="col-span-6 space-y-6 border-r-2 border-gray-200 dark:border-gray-700">
              <div className="py-6 px-8">
                <h2 className="text-xl font-semibold mb-4">Add New Travel Interest</h2>
                <InterestForm locations={(locations as Location[]) || []} userId={user.id} />
              </div>
            </div>
            <div className="col-span-6 space-y-6">
              <div className="py-6 px-8">
                <h2 className="text-xl font-semibold mb-4">Your Travel Interests</h2>
                <InterestsList userId={user.id} initialInterests={interests} />
              </div>
            </div>

            <div className="col-span-12 border-t-2 border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div >
                <SearchResultsWrapper
                  results={searchResults}
                  interestLocations={interestLocations}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
