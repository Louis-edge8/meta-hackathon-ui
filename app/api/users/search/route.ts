import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user to verify authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Search for users by email
    const { data, error } = await supabase.from("users").select("id, email").ilike("email", `%${email}%`).limit(10)

    if (error) {
      console.error("Error searching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: data })
  } catch (error: any) {
    console.error("Error in users search API route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
