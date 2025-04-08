import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: "Profile already exists" })
    }

    // Create profile
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating profile:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in create-profile route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
