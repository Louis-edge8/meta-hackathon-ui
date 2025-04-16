import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("User not authenticated");
    }

    // Fetch packages directly from the database
    // Assuming there's a 'packages' or 'travel_packages' table in Supabase
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .limit(20);  // Fetch more to allow for random selection

    if (error) {
      console.error('Error fetching packages from Supabase:', error);
      throw new Error('Failed to fetch packages from database');
    }

    if (!packages || packages.length === 0) {
      return NextResponse.json({ packages: [] });
    }
    
    // Shuffle the packages and return a random subset
    const shuffled = [...packages].sort(() => 0.5 - Math.random());
    const randomPackages = shuffled.slice(0, Math.min(5, shuffled.length));
    
    return NextResponse.json({ packages: randomPackages });
  } catch (error: any) {
    console.error("Error fetching random packages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch random packages" },
      { status: 500 }
    );
  }
} 