import { Package } from "@/lib/services/search-packages";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Extended Package type with interested_count
interface TrendingPackage extends Package {
  interested_count: number;
}

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

    // Fetch trending packages from the database, ordered by interested_count
    const { data: trendingPackages, error } = await supabase
      .from("travel_packages")
      .select("*, interested_count")
      .order("interested_count", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      packages: trendingPackages
    });
    
  } catch (error: any) {
    console.error("Error fetching trending packages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trending packages" },
      { status: 500 }
    );
  }
} 