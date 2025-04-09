import type { Location } from "@/lib/database.types"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { InterestForm } from "./interest-form"
import { InterestsList } from "./interests-list"

export default async function DashboardPage() {
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

  // Fetch user interests
  const { data: interests } = await supabase
    .from("user_interests")
    .select(`
      *,
      locations (*)
    `)
    .eq("user_id", user.id)

  // Debug: Log the user ID to verify it exists
  console.log("User ID from session:", user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6">Travel Interests Dashboard</h1>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Add New Travel Interest</h2>
                  <InterestForm locations={(locations as Location[]) || []} userId={user.id} />
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Your Travel Interests</h2>
                  <InterestsList userId={user.id} initialInterests={interests || []} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
