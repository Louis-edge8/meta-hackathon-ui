import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardHeader } from "./dashboard-header"
import { InterestForm } from "./interest-form"
import { InterestsList } from "./interests-list"
import type { Location } from "@/lib/database.types"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch locations for the dropdown
  const { data: locations } = await supabase.from("locations").select("*").order("name")

  // Debug: Log the user ID to verify it exists
  console.log("User ID from session:", session.user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6">Travel Interests Dashboard</h1>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Add New Travel Interest</h2>
                  <InterestForm locations={(locations as Location[]) || []} userId={session.user.id} />
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Your Travel Interests</h2>
                  <InterestsList userId={session.user.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
