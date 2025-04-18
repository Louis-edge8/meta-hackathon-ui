import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export interface SearchPackagesParams {
  location_input: string;
  budget_input: string;
  accommodation_input: string;
  activities_input: string;
  num_participants: number;
  preferred_activities: string;
  accommodation_preference: string;
  budget_range: string;
  duration_adjustment: string;
  match_count: number;
  num_suggestions: number;
}

export interface Package {
  id: string;
  title: string;
  provider_id: string;
  location_id: string;
  price: number;
  duration_days: number;
  highlights: string[];
  description: string;
  image_url: string;
  location_vector?: any; // Optional vector type
  duration_vector?: any; // Optional vector type
  isAIGenerated?: boolean; // Added to support AI-generated flag
}

export async function searchPackages(params: SearchPackagesParams): Promise<Package[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const API_URL = "https://hackathon-travel-buddy-pb.fly.dev/search-travel-packages";

  try {
    const URL = `${API_URL}?authorization=${encodeURIComponent(`Bearer ${session.access_token}`)}`;
    console.log('Sending search request:', {
      url: URL,
      params: params
    });
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "accept": "application/json",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "origin": "https://hackathon-travel-buddy-pb.fly.dev",
        "referer": "https://hackathon-travel-buddy-pb.fly.dev/docs"
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search packages error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || "Failed to search packages");
      } catch (e) {
        throw new Error(`Failed to search packages: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Search response:', data);
    return data.packages || data.data || data || [];
  } catch (error: any) {
    console.error('Search packages error:', error);
    throw error;
  }
} 