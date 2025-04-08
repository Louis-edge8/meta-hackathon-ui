import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const interestId = params.id
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // First verify that the interest belongs to the current user
    const { data: interest, error: fetchError } = await supabase
      .from("user_interests")
      .select("user_id")
      .eq("id", interestId)
      .single()

    if (fetchError) {
      console.error("Error fetching interest:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!interest) {
      return NextResponse.json({ error: "Interest not found" }, { status: 404 })
    }

    if (interest.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized: Not your interest" }, { status: 403 })
    }

    // Delete the interest
    const { error: deleteError } = await supabase.from("user_interests").delete().eq("id", interestId)

    if (deleteError) {
      console.error("Error deleting interest:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in delete interest API route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
