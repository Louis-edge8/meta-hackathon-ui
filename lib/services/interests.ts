import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Location, UserInterest } from "../database.types"

export interface InterestWithLocations extends UserInterest {
  locations: Location[]
}

export async function getUserInterestsWithLocations(userId: string): Promise<InterestWithLocations[]> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // First fetch the interests
  const { data: interests, error: interestsError } = await supabase
    .from("user_interests")
    .select(`
      id,
      user_id,
      locations_id,
      locations_text,
      budget,
      duration,
      activities,
      notes
    `)
    .eq("user_id", userId)

  if (interestsError) {
    console.error('Error fetching interests:', interestsError)
    return []
  }

  if (!interests || interests.length === 0) {
    return []
  }

  // Then fetch all locations
  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select("*")
    .in("id", interests.flatMap(interest => interest.locations_id))

  if (locationsError) {
    console.error('Error fetching locations:', locationsError)
    return []
  }

  // Combine interests with their locations
  return interests.map(interest => ({
    ...interest,
    locations: locations?.filter(location => 
      interest.locations_id.includes(location.id)
    ) || []
  }))
} 