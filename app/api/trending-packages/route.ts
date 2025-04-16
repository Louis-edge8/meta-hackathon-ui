import { Package } from "@/lib/services/search-packages";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Extended Package type with interested_count
interface TrendingPackage extends Package {
  interested_count: number;
}

// Mock data for trending packages (replace with actual DB query)
const mockTrendingPackages: TrendingPackage[] = [
  {
    id: "1",
    title: "Tropical Paradise Escape",
    provider_id: "provider1",
    location_id: "location1",
    price: 1299,
    duration_days: 7,
    highlights: ["Beach access", "Spa treatment", "All-inclusive"],
    description: "Enjoy a week in a tropical paradise with pristine beaches and luxury accommodations.",
    image_url: "https://placehold.co/800x450?text=Tropical+Paradise",
    location_vector: null,
    duration_vector: null,
    interested_count: 1250
  },
  {
    id: "2",
    title: "Mountain Adventure Trek",
    provider_id: "provider2",
    location_id: "location2",
    price: 899,
    duration_days: 5,
    highlights: ["Guided hikes", "Wildlife viewing", "Camping"],
    description: "Experience the thrill of mountain hiking with experienced guides in breathtaking scenery.",
    image_url: "https://placehold.co/800x450?text=Mountain+Trek",
    location_vector: null,
    duration_vector: null,
    interested_count: 980
  },
  {
    id: "3",
    title: "European City Tour",
    provider_id: "provider3",
    location_id: "location3",
    price: 1599,
    duration_days: 10,
    highlights: ["Museum passes", "Fine dining", "Guided tours"],
    description: "Visit the most iconic European cities and experience their rich history and culture.",
    image_url: "https://placehold.co/800x450?text=European+Tour",
    location_vector: null,
    duration_vector: null,
    interested_count: 870
  },
  {
    id: "4",
    title: "Desert Safari Adventure",
    provider_id: "provider4",
    location_id: "location4",
    price: 699,
    duration_days: 3,
    highlights: ["Camel riding", "Dune bashing", "Bedouin camps"],
    description: "Explore vast deserts and experience traditional nomadic culture with experienced guides.",
    image_url: "https://placehold.co/800x450?text=Desert+Safari",
    location_vector: null,
    duration_vector: null,
    interested_count: 650
  },
  {
    id: "5",
    title: "Island Hopping Experience",
    provider_id: "provider5",
    location_id: "location5",
    price: 1099,
    duration_days: 6,
    highlights: ["Snorkeling", "Boat tours", "Beach parties"],
    description: "Visit multiple stunning islands and enjoy various water activities and relaxation.",
    image_url: "https://placehold.co/800x450?text=Island+Hopping",
    location_vector: null,
    duration_vector: null,
    interested_count: 520
  }
];

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

    // In a real implementation, you would fetch trending packages from your database
    // For example:
    /*
    const { data: trendingPackages, error } = await supabase
      .from("packages")
      .select("*, interested_count")
      .order("interested_count", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }
    */

    // For now, return mock data
    return NextResponse.json({
      packages: mockTrendingPackages
    });
    
  } catch (error: any) {
    console.error("Error fetching trending packages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trending packages" },
      { status: 500 }
    );
  }
} 