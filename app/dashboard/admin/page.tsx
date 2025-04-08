import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardHeader } from "../dashboard-header"
import { UserSearch } from "../user-search"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6">User Administration</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Search Users</h2>
              <UserSearch />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
