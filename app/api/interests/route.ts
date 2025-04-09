import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const data = await request.json();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    console.log("Authenticated user:", user);
    console.log("Request data:", data);
    // Validate the request data
    // Verify the user ID in the request matches the authenticated user
    if (data.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }

    // First, try to directly insert the interest
    const { error: insertError } = await supabase
      .from("user_interests")
      .insert({
        user_id: user.id,
        location_id: data.location_id,
        budget: data.budget,
        priority_level: data.priority_level,
        activities: data.activities,
        notes: data.notes,
      });

    if (insertError) {
      console.error("Error inserting interest:", insertError);

      // If it's a foreign key constraint error, try a different approach
      if (insertError.code === "23503") {
        // Try to determine which table the foreign key references
        console.log("Foreign key constraint error. Attempting to fix...");

        // Try to create a user entry in a public.users table if it exists
        try {
          const { error: createUserError } = await supabase.rpc(
            "create_user_if_not_exists",
            {
              user_id: user.id,
              user_email: user.email,
            }
          );

          if (createUserError) {
            console.log("Could not create user entry:", createUserError);
          } else {
            console.log("Created user entry successfully");

            // Try the insert again
            const { error: retryError } = await supabase
              .from("user_interests")
              .insert({
                user_id: user.id,
                location_id: data.location_id,
                budget: data.budget,
                priority_level: data.priority_level,
                activities: data.activities,
                notes: data.notes,
              });

            if (retryError) {
              console.error("Error on retry insert:", retryError);
              return NextResponse.json(
                { error: retryError.message },
                { status: 500 }
              );
            }

            return NextResponse.json({ success: true });
          }
        } catch (rpcError) {
          console.log("RPC function not available:", rpcError);
        }

        // If we get here, we couldn't fix the issue automatically
        return NextResponse.json(
          {
            error:
              "Foreign key constraint error. The user_id in user_interests is referencing a table where your user ID doesn't exist.",
            details: insertError.message,
          },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in interests API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Verify the user ID in the request matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }

    // Fetch interests with locations
    const { data, error } = await supabase
      .from("user_interests")
      .select(
        `
        *,
        locations (*)
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching interests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ interests: data });
  } catch (error: any) {
    console.error("Error in interests API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
