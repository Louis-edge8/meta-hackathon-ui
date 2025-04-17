import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Package } from "./search-packages";

export interface SuggestTourParams {
  location_id: string;
  user_preferences?: {
    budget_range?: string;
    duration_preference?: string;
    activity_types?: string[];
  };
  num_suggestions?: number;
}

export async function suggestTour(params: SuggestTourParams): Promise<Package[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const API_URL = "https://hackathon-travel-buddy-pb.fly.dev/suggest-tour";

  try {
    const URL = `${API_URL}?authorization=${encodeURIComponent(`Bearer ${session.access_token}`)}`;
    console.log('Sending tour suggestion request:', {
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
      console.error('Tour suggestion error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.detail || "Failed to get tour suggestions");
      } catch (e) {
        throw new Error(`Failed to get tour suggestions: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Suggestion response:', data);
    return data.packages || data.suggestions || data || [];
  } catch (error: any) {
    console.error('Tour suggestion error:', error);
    throw error;
  }
} 