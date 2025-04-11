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

    // Insert the interest with the new schema
    const { error: insertError } = await supabase
      .from("user_interests")
      .insert({
        user_id: user.id,
        locations_id: data.locations_id,
        locations_text: data.locations_text,
        budget: data.budget,
        duration: data.duration,
        activities: data.activities,
        notes: data.notes,
      });

    if (insertError) {
      console.error("Error inserting interest:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
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

    // First, fetch the interests
    const { data: interests, error: interestsError } = await supabase
      .from("user_interests")
      .select("*")
      .eq("user_id", user.id);

    if (interestsError) {
      console.error("Error fetching interests:", interestsError);
      return NextResponse.json({ error: interestsError.message }, { status: 500 });
    }

    // Then, fetch all unique locations used in the interests
    const locationIds = interests
      .flatMap(interest => interest.locations_id)
      .filter((id): id is string => id !== null && id !== undefined);

    let locations: any[] = [];
    if (locationIds.length > 0) {
      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("*")
        .in("id", locationIds);

      if (locationsError) {
        console.error("Error fetching locations:", locationsError);
        return NextResponse.json({ error: locationsError.message }, { status: 500 });
      }

      locations = locationsData || [];
    }

    // Combine the data
    const interestsWithLocations = interests.map(interest => ({
      ...interest,
      locations: locations.filter(loc => interest.locations_id.includes(loc.id))
    }));

    return NextResponse.json({ interests: interestsWithLocations });
  } catch (error: any) {
    console.error("Error in interests API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
