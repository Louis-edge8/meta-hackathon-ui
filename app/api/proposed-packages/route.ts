import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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

    // Fetch random proposed travel packages from the database
    // We're using a random order to randomize results
    const { data: proposedPackages, error } = await supabase
      .from("proposed_travel_packages")
      .select("*")
      .order("id", { ascending: false }) // Just to have some order
      .limit(3); // Limiting to 3 proposed packages

    if (error) {
      throw error;
    }

    return NextResponse.json({
      packages: proposedPackages
    });
    
  } catch (error: any) {
    console.error("Error fetching proposed packages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposed packages" },
      { status: 500 }
    );
  }
} 